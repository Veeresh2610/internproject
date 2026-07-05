import os
import shutil
from datetime import datetime, date, time
from typing import Optional, List
from fastapi import APIRouter, Depends, Header, Query, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import extract, or_, and_

from app.core.database import get_db
from app.db.models import (
    ErpCurriculum, Student, IEMSUsers, IEMSDepartment, IEMSAcademicBatch,
    LMSCrossDeptMentor, LMSMentorsGroup, LMSMentorsGroupTerms,
    LMSGroupMentors, LMSGroupMentees, LMSMentoringSchedule,
    LMSMentoringSubGroup, LMSMentoringSubGrpDate, LMSQuestionnaires,
    LMSQuestionnairesQuestions, LMSQuestionnairesOptions,
    LMSMenteeQuestionnaireResponse, LMSMenteeQuestionnaireResponseQue,
    LMSMenteeQuestionnaireResponseOption, LMSMMPSessionSuggestion,
    LMSMMPSessionSuggestionGenericComments, LMSMMPSessionSuggestionIndividualComments
)
from app.utils.auth_helper import get_current_user
from app.utils.http_return_helper import returnException, returnSuccess

router = APIRouter()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_time_str(time_str: str) -> time:
    try:
        time_str = time_str.strip().upper()
        if "AM" in time_str or "PM" in time_str:
            t_struct = datetime.strptime(time_str, "%I:%M %p")
            return t_struct.time()
        else:
            parts = time_str.split(':')
            if len(parts) >= 2:
                hour = int(parts[0])
                minute = int(parts[1])
                second = int(parts[2]) if len(parts) > 2 else 0
                return time(hour, minute, second)
    except Exception:
        pass
    return time(10, 0, 0)


def parse_date_str(date_str: str) -> date:
    try:
        return datetime.strptime(date_str.strip(), "%Y-%m-%d").date()
    except Exception:
        return datetime.now().date()


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------

class SlotCreate(BaseModel):
    start_date: str
    end_date: str
    start_time: str
    end_time: str


class SubGroupCreate(BaseModel):
    sub_group_name: str
    location: str
    slots: List[SlotCreate]


class SessionCreatePayload(BaseModel):
    mentors_group_terms_id: int
    questionnaire_id: int
    session_agenda: Optional[str] = None
    sub_groups: List[SubGroupCreate]


class QuestionCreate(BaseModel):
    que_no: int
    question: str
    que_type_id: int  # 1: Single, 2: Multiple, 3: Open-ended
    questionnaire_type_id: int  # 1: Personal, 2: Academic
    que_is_mandatory: bool
    options: List[str] = []  # list of option strings


class QuestionnaireCreatePayload(BaseModel):
    questionnaire_name: str
    message_to_mentees: Optional[str] = None
    access_level: int = 0  # 0, 1, 2, 3 as per settings
    parent_id: Optional[int] = None
    questions: List[QuestionCreate]


class SendChatMessagePayload(BaseModel):
    mentee_id: Optional[int] = None  # None for group chat/guidance
    comment: str
    attachment: Optional[str] = None


# ---------------------------------------------------------------------------
# 1. GET /curriculums – List logged in user's assigned curriculums
# ---------------------------------------------------------------------------
@router.get("/curriculums")
def list_mentor_curriculums(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List curriculums to which the logged in user is assigned as mentor,
    irrespective of any department.
    """
    user_id = current_user.get("user_id")

    # Fetch unique curriculum ids assigned to this mentor in cross-dept table
    assignments = (
        db.query(LMSCrossDeptMentor.curriculum_id)
        .filter(
            LMSCrossDeptMentor.mentor_user_id == user_id,
            LMSCrossDeptMentor.status == 1,
            LMSCrossDeptMentor.curriculum_id.isnot(None)
        )
        .distinct()
        .all()
    )
    assigned_crclm_ids = [a[0] for a in assignments]

    # Fallback/Additional check: check if the mentor has any groups in lms_group_mentors
    # to find any curriculum mapped via academic batches.
    group_mentor_records = (
        db.query(LMSGroupMentors)
        .filter(LMSGroupMentors.mentor_id == user_id)
        .all()
    )
    if group_mentor_records:
        terms_ids = [g.mentors_group_terms_id for g in group_mentor_records]
        terms = db.query(LMSMentorsGroupTerms).filter(LMSMentorsGroupTerms.mentors_group_terms_id.in_(terms_ids)).all()
        batch_ids = [t.academic_batch_id for t in terms]
        if batch_ids:
            batches = db.query(IEMSAcademicBatch).filter(IEMSAcademicBatch.academic_batch_id.in_(batch_ids)).all()
            for b in batches:
                # Find curriculums matching the program and department of the batch
                matching_crclms = db.query(ErpCurriculum).filter(
                    ErpCurriculum.erp_pgm_id == b.pgm_id,
                    ErpCurriculum.erp_dept_id == b.dept_id,
                    ErpCurriculum.status == 1
                ).all()
                for c in matching_crclms:
                    assigned_crclm_ids.append(c.erp_crclm_id)

    # De-duplicate curriculum IDs
    assigned_crclm_ids = list(set(assigned_crclm_ids))

    # Fetch curriculum details
    if assigned_crclm_ids:
        curriculums = (
            db.query(ErpCurriculum)
            .filter(
                ErpCurriculum.erp_crclm_id.in_(assigned_crclm_ids),
                ErpCurriculum.status == 1
            )
            .order_by(ErpCurriculum.erp_crclm_name)
            .all()
        )
    else:
        # If no explicit assignments, return empty or return all as fallback for demo/testing
        curriculums = []

    data = [
        {
            "crclm_id": c.erp_crclm_id,
            "crclm_name": c.erp_crclm_name,
            "start_year": c.erp_crclm_start_year,
            "end_year": c.erp_crclm_end_year,
        }
        for c in curriculums
    ]
    return returnSuccess(data)


# ---------------------------------------------------------------------------
# 2. GET /groups – List mentoring groups for selected curriculum
# ---------------------------------------------------------------------------
@router.get("/groups")
def list_mentoring_groups(
    curriculum_id: int = Query(..., description="Curriculum ID"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List mentoring groups for a selected curriculum.
    """
    curriculum = db.query(ErpCurriculum).filter(ErpCurriculum.erp_crclm_id == curriculum_id).first()
    if not curriculum:
        return returnException("Selected curriculum not found.")

    # Find academic batches sharing the same program and department as curriculum
    batches = db.query(IEMSAcademicBatch).filter(
        IEMSAcademicBatch.pgm_id == curriculum.erp_pgm_id,
        IEMSAcademicBatch.dept_id == curriculum.erp_dept_id
    ).all()
    batch_ids = [b.academic_batch_id for b in batches]

    if not batch_ids:
        # Return empty list if no batches found
        return returnSuccess([])

    # Query groups for these batches
    groups = (
        db.query(LMSMentorsGroup)
        .filter(LMSMentorsGroup.academic_batch_id.in_(batch_ids))
        .all()
    )

    data = []
    for g in groups:
        # Find matching terms/semesters
        terms = db.query(LMSMentorsGroupTerms).filter(
            LMSMentorsGroupTerms.mentors_group_id == g.mentors_group_id
        ).all()
        
        for t in terms:
            data.append({
                "mentors_group_id": g.mentors_group_id,
                "mentors_group_terms_id": t.mentors_group_terms_id,
                "group_title": g.mentors_pgm_title or "Unnamed Group",
                "term_id": t.semester_id,
                "term_name": f"Term {t.semester_id}",
                "config_type_id": g.config_type_id,
                "questionnaire_id": g.questionnaire_id
            })

    return returnSuccess(data)


# ---------------------------------------------------------------------------
# 3. GET /sessions – List mentoring sessions & details for curriculum & month
# ---------------------------------------------------------------------------
@router.get("/sessions")
def list_mentoring_sessions(
    curriculum_id: int = Query(..., description="Curriculum ID"),
    month: str = Query(..., description="Month in YYYY-MM format"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List mentoring sessions & details for selected curriculum & month.
    """
    curriculum = db.query(ErpCurriculum).filter(ErpCurriculum.erp_crclm_id == curriculum_id).first()
    if not curriculum:
        return returnException("Selected curriculum not found.")

    try:
        year, month_val = map(int, month.split('-'))
    except Exception:
        return returnException("Invalid month format. Use YYYY-MM.")

    # Find matching batches
    batches = db.query(IEMSAcademicBatch).filter(
        IEMSAcademicBatch.pgm_id == curriculum.erp_pgm_id,
        IEMSAcademicBatch.dept_id == curriculum.erp_dept_id
    ).all()
    batch_ids = [b.academic_batch_id for b in batches]

    if not batch_ids:
        return returnSuccess([])

    # Fetch mentoring schedules for these batches
    schedules = (
        db.query(LMSMentoringSchedule)
        .join(LMSMentorsGroupTerms, LMSMentoringSchedule.mentors_group_terms_id == LMSMentorsGroupTerms.mentors_group_terms_id)
        .filter(LMSMentorsGroupTerms.academic_batch_id.in_(batch_ids))
        .all()
    )

    data = []
    for s in schedules:
        # Fetch subgroups for each schedule
        sub_groups = db.query(LMSMentoringSubGroup).filter(
            LMSMentoringSubGroup.schedule_id == s.schedule_id
        ).all()

        sg_list = []
        has_matching_slot = False

        for sg in sub_groups:
            # Fetch slots for this subgroup
            slots = db.query(LMSMentoringSubGrpDate).filter(
                LMSMentoringSubGrpDate.sub_group_id == sg.sub_group_id
            ).all()

            slot_list = []
            for slot in slots:
                # Check if this slot belongs to the selected month and year
                is_match = slot.start_date.year == year and slot.start_date.month == month_val
                if is_match:
                    has_matching_slot = True
                
                slot_list.append({
                    "sub_group_date_id": slot.sub_group_date_id,
                    "start_date": slot.start_date.strftime("%Y-%m-%d"),
                    "end_date": slot.end_date.strftime("%Y-%m-%d"),
                    "start_time": slot.start_time.strftime("%I:%M %p"),
                    "end_time": slot.end_time.strftime("%I:%M %p"),
                    "status": slot.status
                })

            # Fetch count of mentees in this subgroup / schedule
            mentee_count = db.query(LMSGroupMentees).filter(
                LMSGroupMentees.mentors_group_terms_id == s.mentors_group_terms_id
            ).count()

            sg_list.append({
                "sub_group_id": sg.sub_group_id,
                "sub_group_name": sg.sub_group_name,
                "location": sg.location,
                "mentee_count": mentee_count,
                "slots": slot_list
            })

        # Find mentors group info
        terms_rec = db.query(LMSMentorsGroupTerms).filter(
            LMSMentorsGroupTerms.mentors_group_terms_id == s.mentors_group_terms_id
        ).first()
        group_rec = db.query(LMSMentorsGroup).filter(
            LMSMentorsGroup.mentors_group_id == terms_rec.mentors_group_id
        ).first() if terms_rec else None

        # Filter session schedules that have at least one slot matching the month
        if has_matching_slot:
            data.append({
                "schedule_id": s.schedule_id,
                "mentors_group_terms_id": s.mentors_group_terms_id,
                "questionnaire_id": s.questionnaire_id,
                "session_agenda": s.session_agenda,
                "group_title": group_rec.mentors_pgm_title if group_rec else "Mentoring Group",
                "term_name": f"Term {terms_rec.semester_id}" if terms_rec else "Term 1",
                "sub_groups": sg_list
            })

    return returnSuccess(data)


# ---------------------------------------------------------------------------
# 4. POST /sessions/save – Create new mentoring session
# ---------------------------------------------------------------------------
@router.post("/sessions/save")
def create_mentoring_session(
    payload: SessionCreatePayload,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new mentoring session with sub-groups and time slots.
    """
    user_id = current_user.get("user_id")

    # 1. Create LMSMentoringSchedule
    schedule = LMSMentoringSchedule(
        mentors_group_terms_id=payload.mentors_group_terms_id,
        questionnaire_id=payload.questionnaire_id,
        session_agenda=payload.session_agenda,
        created_by=user_id,
        created_date=datetime.now()
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)

    # 2. Add Sub-groups & Slots
    for sg_data in payload.sub_groups:
        sub_group = LMSMentoringSubGroup(
            schedule_id=schedule.schedule_id,
            sub_group_name=sg_data.sub_group_name,
            location=sg_data.location,
            created_by=user_id,
            created_date=datetime.now()
        )
        db.add(sub_group)
        db.commit()
        db.refresh(sub_group)

        for slot_data in sg_data.slots:
            slot = LMSMentoringSubGrpDate(
                sub_group_id=sub_group.sub_group_id,
                start_date=parse_date_str(slot_data.start_date),
                end_date=parse_date_str(slot_data.end_date),
                start_time=parse_time_str(slot_data.start_time),
                end_time=parse_time_str(slot_data.end_time),
                status=True,
                created_by=user_id,
                created_date=datetime.now()
            )
            db.add(slot)

    db.commit()

    return returnSuccess(
        {"schedule_id": schedule.schedule_id},
        "Mentoring session created successfully."
    )


# ---------------------------------------------------------------------------
# 5. GET /questionnaires/{id} – Fetch questionnaire & field settings
# ---------------------------------------------------------------------------
@router.get("/questionnaires/{id}")
def fetch_questionnaire(
    id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetch a questionnaire, its questions, options, and its access level / field settings.
    """
    questionnaire = db.query(LMSQuestionnaires).filter(
        LMSQuestionnaires.questionnaire_id == id
    ).first()

    if not questionnaire:
        return returnException("Questionnaire not found.")

    # Fetch questions
    questions = (
        db.query(LMSQuestionnairesQuestions)
        .filter(LMSQuestionnairesQuestions.questionnaire_id == id)
        .order_by(LMSQuestionnairesQuestions.que_no)
        .all()
    )

    que_data = []
    for q in questions:
        # Fetch options for this question
        options = (
            db.query(LMSQuestionnairesOptions)
            .filter(LMSQuestionnairesOptions.questionnaire_que_id == q.questionnaire_que_id)
            .all()
        )
        
        opt_data = [
            {
                "questionnaire_options_id": o.questionnaire_options_id,
                "que_option": o.que_option,
                "specify_flag": o.specify_flag
            }
            for o in options
        ]

        que_data.append({
            "questionnaire_que_id": q.questionnaire_que_id,
            "que_no": q.que_no,
            "question": q.question,
            "que_type_id": q.que_type_id,
            "questionnaire_type_id": q.questionnaire_type_id,
            "que_is_mandatory": q.que_is_mandatory,
            "options": opt_data
        })

    data = {
        "questionnaire_id": questionnaire.questionnaire_id,
        "questionnaire_name": questionnaire.questionnaire_name,
        "message_to_mentees": questionnaire.message_to_mentees,
        "access_level": questionnaire.access_level,
        "parent_id": questionnaire.parent_id,
        "questions": que_data
    }

    return returnSuccess(data)


# ---------------------------------------------------------------------------
# 6. POST /questionnaires/save – Create/Save Questionnaire
# ---------------------------------------------------------------------------
@router.post("/questionnaires/save")
def save_questionnaire(
    payload: QuestionnaireCreatePayload,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new questionnaire template with title, questions and access settings.
    """
    user_id = current_user.get("user_id")

    # Create Questionnaire
    q_rec = LMSQuestionnaires(
        questionnaire_name=payload.questionnaire_name,
        message_to_mentees=payload.message_to_mentees,
        access_level=payload.access_level,
        parent_id=payload.parent_id,
        created_by=user_id,
        created_date=datetime.now()
    )
    db.add(q_rec)
    db.commit()
    db.refresh(q_rec)

    # Create Questions & Options
    for q_data in payload.questions:
        q_que = LMSQuestionnairesQuestions(
            questionnaire_id=q_rec.questionnaire_id,
            que_type_id=q_data.que_type_id,
            que_no=q_data.que_no,
            question=q_data.question,
            questionnaire_type_id=q_data.questionnaire_type_id,
            que_is_mandatory=q_data.que_is_mandatory,
            created_by=user_id,
            created_date=datetime.now()
        )
        db.add(q_que)
        db.commit()
        db.refresh(q_que)

        for opt_str in q_data.options:
            specify = "SPECIFY" in opt_str.upper() or "____" in opt_str
            q_opt = LMSQuestionnairesOptions(
                questionnaire_que_id=q_que.questionnaire_que_id,
                que_option=opt_str,
                specify_flag=specify,
                created_by=user_id,
                created_date=datetime.now()
            )
            db.add(q_opt)

    db.commit()

    return returnSuccess(
        {"questionnaire_id": q_rec.questionnaire_id},
        "Questionnaire saved successfully."
    )


# ---------------------------------------------------------------------------
# 7. GET /sessions/{schedule_id}/mentees – List mentees & their responses
# ---------------------------------------------------------------------------
@router.get("/sessions/{schedule_id}/mentees")
def list_session_mentees(
    schedule_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List mentees of the created mentoring session and view responses if submitted.
    """
    schedule = db.query(LMSMentoringSchedule).filter(
        LMSMentoringSchedule.schedule_id == schedule_id
    ).first()

    if not schedule:
        return returnException("Session not found.")

    # Get mentees registered to this group terms
    mentees = db.query(LMSGroupMentees).filter(
        LMSGroupMentees.mentors_group_terms_id == schedule.mentors_group_terms_id
    ).all()

    data = []
    for m in mentees:
        # Fetch student/mentee profile info from erp_student
        student = db.query(Student).filter(Student.erp_student_id == m.student_id).first()
        # Fallback to IEMSUsers if student record not in erp_student
        student_user = db.query(IEMSUsers).filter(IEMSUsers.id == m.student_id).first() if not student else None

        student_name = ""
        student_usn = ""
        student_email = ""

        if student:
            student_name = student.full_name or f"{student.first_name or ''} {student.last_name or ''}".strip()
            student_usn = student.erp_student_usn or ""
            student_email = student.email_id or ""
        elif student_user:
            student_name = f"{student_user.first_name or ''} {student_user.last_name or ''}".strip() or student_user.username
            student_usn = ""
            student_email = student_user.email or ""

        # Fetch responses submitted by this mentee for this schedule
        response = db.query(LMSMenteeQuestionnaireResponse).filter(
            LMSMenteeQuestionnaireResponse.student_id == m.student_id,
            LMSMenteeQuestionnaireResponse.schedule_id == schedule_id
        ).first()

        res_data = None
        if response:
            res_que_records = db.query(LMSMenteeQuestionnaireResponseQue).filter(
                LMSMenteeQuestionnaireResponseQue.questionnaire_response_id == response.questionnaire_response_id
            ).all()

            que_answers = []
            for rq in res_que_records:
                # Find options selected for this response question
                opt_records = db.query(LMSMenteeQuestionnaireResponseOption).filter(
                    LMSMenteeQuestionnaireResponseOption.questionnaire_response_que_id == rq.questionnaire_response_que_id
                ).all()

                opts = [
                    {
                        "questionnaire_options_id": o.questionnaire_options_id,
                        "specification": o.specification
                    }
                    for o in opt_records
                ]

                # Fetch question text
                question_text = ""
                q_rec = db.query(LMSQuestionnairesQuestions).filter(
                    LMSQuestionnairesQuestions.questionnaire_que_id == rq.questionnaire_que_id
                ).first()
                if q_rec:
                    question_text = q_rec.question

                que_answers.append({
                    "questionnaire_que_id": rq.questionnaire_que_id,
                    "question_text": question_text,
                    "text_answer": rq.text_answer,
                    "selected_options": opts
                })

            res_data = {
                "questionnaire_response_id": response.questionnaire_response_id,
                "submitted_at": response.created_date.strftime("%Y-%m-%d %H:%M:%S") if response.created_date else None,
                "answers": que_answers
            }

        data.append({
            "student_id": m.student_id,
            "student_name": student_name,
            "student_usn": student_usn,
            "student_email": student_email,
            "response": res_data
        })

    return returnSuccess(data)


# ---------------------------------------------------------------------------
# 8. GET /sessions/{schedule_id}/chat – Fetch chat messages
# ---------------------------------------------------------------------------
@router.get("/sessions/{schedule_id}/chat")
def fetch_chat_messages(
    schedule_id: int,
    mentee_id: Optional[int] = Query(None, description="Mentee student ID for individual chat. If omitted, fetches group general guidance comments."),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetch chat messages for the session.
    If `mentee_id` is provided, fetches individual chat between mentor and that mentee.
    If `mentee_id` is omitted, fetches group general guidance comments.
    """
    user_id = current_user.get("user_id")

    # Find or create session suggestion record
    suggestion = db.query(LMSMMPSessionSuggestion).filter(
        LMSMMPSessionSuggestion.schedule_id == schedule_id
    ).first()

    if not suggestion:
        suggestion = LMSMMPSessionSuggestion(
            schedule_id=schedule_id,
            created_by=user_id,
            created_date=datetime.now()
        )
        db.add(suggestion)
        db.commit()
        db.refresh(suggestion)

    messages = []

    if mentee_id is not None:
        # Fetch individual chat messages
        comments = (
            db.query(LMSMMPSessionSuggestionIndividualComments)
            .filter(
                LMSMMPSessionSuggestionIndividualComments.session_suggestion_id == suggestion.session_suggestion_id,
                LMSMMPSessionSuggestionIndividualComments.mentee_id == mentee_id
            )
            .order_by(LMSMMPSessionSuggestionIndividualComments.created_date)
            .all()
        )
        
        for c in comments:
            sender = db.query(IEMSUsers).filter(IEMSUsers.id == c.from_user_id).first()
            sender_name = f"{sender.first_name or ''} {sender.last_name or ''}".strip() if sender else "User"
            
            messages.append({
                "message_id": c.individual_comment_id,
                "from_user_id": c.from_user_id,
                "sender_name": sender_name,
                "comment": c.comment,
                "attachment": c.attachment,
                "created_date": c.created_date.strftime("%Y-%m-%d %H:%M:%S") if c.created_date else None,
                "from_user_type": c.from_user_type  # 0=mentor, 1=student
            })
    else:
        # Fetch group general guidance comments
        comments = (
            db.query(LMSMMPSessionSuggestionGenericComments)
            .filter(
                LMSMMPSessionSuggestionGenericComments.session_suggestion_id == suggestion.session_suggestion_id
            )
            .order_by(LMSMMPSessionSuggestionGenericComments.created_date)
            .all()
        )

        for c in comments:
            sender = db.query(IEMSUsers).filter(IEMSUsers.id == c.created_by).first()
            sender_name = f"{sender.first_name or ''} {sender.last_name or ''}".strip() if sender else "User"

            messages.append({
                "message_id": c.generic_comment_id,
                "sender_name": sender_name,
                "comment": c.comment,
                "attachment": c.attachment,
                "created_date": c.created_date.strftime("%Y-%m-%d %H:%M:%S") if c.created_date else None,
                "user_type": c.user_type  # 0=mentor, 1=student
            })

    return returnSuccess(messages)


# ---------------------------------------------------------------------------
# 9. POST /sessions/{schedule_id}/chat/send – Send chat message
# ---------------------------------------------------------------------------
@router.post("/sessions/{schedule_id}/chat/send")
def send_chat_message(
    schedule_id: int,
    payload: SendChatMessagePayload,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Send an individual chat message or a general guidance comment in the group.
    Supports optional attachment paths.
    """
    user_id = current_user.get("user_id")

    # Find or create session suggestion record
    suggestion = db.query(LMSMMPSessionSuggestion).filter(
        LMSMMPSessionSuggestion.schedule_id == schedule_id
    ).first()

    if not suggestion:
        suggestion = LMSMMPSessionSuggestion(
            schedule_id=schedule_id,
            created_by=user_id,
            created_date=datetime.now()
        )
        db.add(suggestion)
        db.commit()
        db.refresh(suggestion)

    if payload.mentee_id is not None:
        # Insert individual comment
        new_comment = LMSMMPSessionSuggestionIndividualComments(
            session_suggestion_id=suggestion.session_suggestion_id,
            comment=payload.comment,
            attachment=payload.attachment,
            from_user_id=user_id,
            mentee_id=payload.mentee_id,
            from_user_type=False,  # False/0 = mentor
            created_by=user_id,
            created_date=datetime.now()
        )
        db.add(new_comment)
        db.commit()
        db.refresh(new_comment)
        
        sender = db.query(IEMSUsers).filter(IEMSUsers.id == user_id).first()
        sender_name = f"{sender.first_name or ''} {sender.last_name or ''}".strip() if sender else "User"

        data = {
            "message_id": new_comment.individual_comment_id,
            "from_user_id": user_id,
            "sender_name": sender_name,
            "comment": new_comment.comment,
            "attachment": new_comment.attachment,
            "created_date": new_comment.created_date.strftime("%Y-%m-%d %H:%M:%S"),
            "from_user_type": new_comment.from_user_type
        }
    else:
        # Insert group comment
        new_comment = LMSMMPSessionSuggestionGenericComments(
            session_suggestion_id=suggestion.session_suggestion_id,
            comment=payload.comment,
            attachment=payload.attachment,
            suggestion_type=False,  # General comment
            user_type=False,  # False/0 = mentor
            created_by=user_id,
            created_date=datetime.now()
        )
        db.add(new_comment)
        db.commit()
        db.refresh(new_comment)

        sender = db.query(IEMSUsers).filter(IEMSUsers.id == user_id).first()
        sender_name = f"{sender.first_name or ''} {sender.last_name or ''}".strip() if sender else "User"

        data = {
            "message_id": new_comment.generic_comment_id,
            "sender_name": sender_name,
            "comment": new_comment.comment,
            "attachment": new_comment.attachment,
            "created_date": new_comment.created_date.strftime("%Y-%m-%d %H:%M:%S"),
            "user_type": new_comment.user_type
        }

    return returnSuccess(data, "Message sent successfully.")


# ---------------------------------------------------------------------------
# 10. POST /upload – Upload attachment
# ---------------------------------------------------------------------------
@router.post("/upload")
def upload_attachment(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Helper endpoint to upload chat or guidance attachments.
    """
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    # Generate unique filename using timestamp
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    clean_filename = f"{timestamp}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(upload_dir, clean_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        return returnException(f"Failed to save file: {str(e)}")

    # Return the relative path to be stored in the database
    return returnSuccess({"file_path": f"/uploads/{clean_filename}"}, "File uploaded successfully.")
