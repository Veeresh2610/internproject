"""
LMS Mentoring Session Module
Base URL: /mentoring-session

Endpoints:
 1. GET  /get_academic_batch_list
 2. GET  /get_semesters_by_academic_batch/{academic_batch_id}
 3. GET  /get_groups_by_academic_batch/{academic_batch_id}
 4. GET  /get_group_mentees/{mentors_group_id}
 5. POST /save_mentoring_session
 6. GET  /get_mentoring_sessions
 7. GET  /get_session_mentees/{schedule_id}
 8. PUT  /update_mentoring_session/{schedule_id}
 9. DELETE /delete_mentoring_session/{schedule_id}
"""

from datetime import datetime, date, time
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.db.models import (
    IEMSAcademicBatch,
    IEMSemester,
    LMSMentorsGroup,
    LMSMentorsGroupTerms,
    LMSGroupMentors,
    LMSGroupMentees,
    LMSMentoringSchedule,
    LMSMentoringSubGroup,
    LMSMentoringSubGrpDate,
    LMSMentoringSubGrpMentee,
    Student,
    IEMSUsers,
)
from app.utils.auth_helper import get_current_user
from app.utils.http_return_helper import returnException, returnSuccess

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _parse_time(time_str: str) -> time:
    """Parse HH:MM:SS or HH:MM string into a time object."""
    try:
        parts = time_str.strip().split(":")
        hour = int(parts[0])
        minute = int(parts[1])
        second = int(parts[2]) if len(parts) > 2 else 0
        return time(hour, minute, second)
    except Exception:
        return time(0, 0, 0)


def _parse_date(date_str: str) -> date:
    """Parse YYYY-MM-DD string into a date object."""
    try:
        return datetime.strptime(date_str.strip(), "%Y-%m-%d").date()
    except Exception:
        return datetime.now().date()


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------

class DateSlot(BaseModel):
    start_date: str
    end_date: str
    start_time: str
    end_time: str


class SubGroupPayload(BaseModel):
    sub_group_name: str
    location: str
    dates: List[DateSlot]
    mentee_ids: List[int]


class SessionPayload(BaseModel):
    academic_batch_id: int
    mentors_group_id: int
    semester_id: int
    session_agenda: Optional[str] = None
    sub_groups: List[SubGroupPayload]


# ---------------------------------------------------------------------------
# 1. GET /get_academic_batch_list
# ---------------------------------------------------------------------------
@router.get("/get_academic_batch_list")
def get_academic_batch_list(db: Session = Depends(get_db)):
    """Returns all Academic Batches (Curriculum)."""
    batches = db.query(IEMSAcademicBatch).filter(
        IEMSAcademicBatch.status == 1
    ).order_by(IEMSAcademicBatch.academic_batch_id).all()

    data = [
        {
            "academic_batch_id": b.academic_batch_id,
            "academic_batch_code": b.academic_batch_code,
            "academic_batch_desc": b.academic_batch_desc,
        }
        for b in batches
    ]
    return returnSuccess(data)


@router.get("/get_curriculum_list")
def get_curriculum_list(db: Session = Depends(get_db)):
    """Alias for /get_academic_batch_list."""
    return get_academic_batch_list(db)


# ---------------------------------------------------------------------------
# 2. GET /get_semesters_by_academic_batch/{academic_batch_id}
# ---------------------------------------------------------------------------
@router.get("/get_semesters_by_academic_batch/{academic_batch_id}")
def get_semesters_by_academic_batch(
    academic_batch_id: int,
    db: Session = Depends(get_db),
):
    """Returns all semesters belonging to the given academic batch."""
    semesters = (
        db.query(IEMSemester)
        .filter(
            IEMSemester.academic_batch_id == academic_batch_id,
            IEMSemester.status == 1,
        )
        .order_by(IEMSemester.semester)
        .all()
    )

    data = [
        {
            "semester_id": s.semester_id,
            "semester": s.semester,
            "semester_desc": s.semester_desc,
        }
        for s in semesters
    ]
    return returnSuccess(data)


# ---------------------------------------------------------------------------
# 3. GET /get_groups_by_academic_batch/{academic_batch_id}
# ---------------------------------------------------------------------------
@router.get("/get_groups_by_academic_batch/{academic_batch_id}")
def get_groups_by_academic_batch(
    academic_batch_id: int,
    db: Session = Depends(get_db),
):
    """Returns all mentor groups mapped to the academic batch."""
    groups = (
        db.query(LMSMentorsGroup)
        .filter(LMSMentorsGroup.academic_batch_id == academic_batch_id)
        .all()
    )

    data = []
    for g in groups:
        # Fetch group terms for this group
        terms = (
            db.query(LMSMentorsGroupTerms)
            .filter(
                LMSMentorsGroupTerms.mentors_group_id == g.mentors_group_id,
                LMSMentorsGroupTerms.academic_batch_id == academic_batch_id,
            )
            .all()
        )
        terms_ids = [t.mentors_group_terms_id for t in terms]

        mentor_rows = (
            db.query(LMSGroupMentors)
            .filter(LMSGroupMentors.mentors_group_terms_id.in_(terms_ids))
            .all()
        ) if terms_ids else []

        mentors_map: dict = {}
        for mr in mentor_rows:
            if mr.mentor_id not in mentors_map:
                mentors_map[mr.mentor_id] = {"mentor_id": mr.mentor_id, "mentees": []}

            mentees = (
                db.query(LMSGroupMentees)
                .filter(
                    LMSGroupMentees.group_mentor_id == mr.group_mentor_id,
                    LMSGroupMentees.mentors_group_terms_id.in_(terms_ids),
                )
                .all()
            )
            existing_ids = {m["student_id"] for m in mentors_map[mr.mentor_id]["mentees"]}
            for me in mentees:
                if me.student_id not in existing_ids:
                    mentors_map[mr.mentor_id]["mentees"].append({"student_id": me.student_id})
                    existing_ids.add(me.student_id)

        data.append(
            {
                "mentors_group_id": g.mentors_group_id,
                "mentors_pgm_title": g.mentors_pgm_title,
                "questionnaire_id": g.questionnaire_id,
                "mentors": list(mentors_map.values()),
            }
        )

    return returnSuccess(data)


# ---------------------------------------------------------------------------
# 4. GET /get_group_mentees/{mentors_group_id}
# ---------------------------------------------------------------------------
@router.get("/get_group_mentees/{mentors_group_id}")
def get_group_mentees(
    mentors_group_id: int,
    db: Session = Depends(get_db),
):
    """Returns all mentees registered under the selected mentor group."""
    terms = (
        db.query(LMSMentorsGroupTerms)
        .filter(LMSMentorsGroupTerms.mentors_group_id == mentors_group_id)
        .all()
    )
    terms_ids = [t.mentors_group_terms_id for t in terms]

    if not terms_ids:
        return returnSuccess([])

    mentee_rows = (
        db.query(LMSGroupMentees)
        .filter(LMSGroupMentees.mentors_group_terms_id.in_(terms_ids))
        .all()
    )

    seen: set = set()
    data = []
    for m in mentee_rows:
        if m.student_id in seen:
            continue
        seen.add(m.student_id)

        student = db.query(Student).filter(
            Student.erp_student_id == m.student_id
        ).first()
        student_user = db.query(IEMSUsers).filter(IEMSUsers.id == m.student_id).first() if not student else None

        student_name = ""
        if student:
            student_name = (
                student.full_name
                or f"{student.first_name or ''} {student.last_name or ''}".strip()
            )
        elif student_user:
            student_name = (
                f"{student_user.first_name or ''} {student_user.last_name or ''}".strip()
                or student_user.username
            )

        data.append({"student_id": m.student_id, "student_name": student_name})

    return returnSuccess(data)


# ---------------------------------------------------------------------------
# 5. POST /save_mentoring_session
# ---------------------------------------------------------------------------
@router.post("/save_mentoring_session")
def save_mentoring_session(
    payload: SessionPayload,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Creates a mentoring session, subgroup, dates and maps mentees."""
    user_id = current_user.get("user_id")

    # Validation: Group belongs to batch
    group = db.query(LMSMentorsGroup).filter(
        LMSMentorsGroup.mentors_group_id == payload.mentors_group_id,
        LMSMentorsGroup.academic_batch_id == payload.academic_batch_id,
    ).first()
    if not group:
        return returnException("Invalid mentoring group selected")

    # Validation: Semester belongs to group
    group_term = db.query(LMSMentorsGroupTerms).filter(
        LMSMentorsGroupTerms.mentors_group_id == payload.mentors_group_id,
        LMSMentorsGroupTerms.semester_id == payload.semester_id,
        LMSMentorsGroupTerms.academic_batch_id == payload.academic_batch_id,
    ).first()
    if not group_term:
        return returnException("Selected semester is not mapped to group")

    # Validation: Duplicate mentee check
    all_mentee_ids: List[int] = []
    for sg in payload.sub_groups:
        all_mentee_ids.extend(sg.mentee_ids)

    if all_mentee_ids:
        existing_mappings = (
            db.query(LMSMentoringSubGrpMentee)
            .filter(LMSMentoringSubGrpMentee.student_id.in_(all_mentee_ids))
            .all()
        )
        if existing_mappings:
            duplicate_ids = list({m.student_id for m in existing_mappings})
            return returnException(
                f"Mentees already mapped to another session : {duplicate_ids}"
            )

    # Validation: Date & Time ranges
    for sg in payload.sub_groups:
        for d in sg.dates:
            start_date = _parse_date(d.start_date)
            end_date = _parse_date(d.end_date)
            start_time = _parse_time(d.start_time)
            end_time = _parse_time(d.end_time)

            if start_date > end_date:
                return returnException("Start date cannot be greater than end date")
            if start_time >= end_time:
                return returnException("Start time must be less than end time")

    # Create Schedule
    schedule = LMSMentoringSchedule(
        mentors_group_terms_id=group_term.mentors_group_terms_id,
        questionnaire_id=group.questionnaire_id,
        session_agenda=payload.session_agenda,
        created_by=user_id,
        created_date=datetime.now(),
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)

    # Create Subgroups, Dates, and Mentees
    for sg_data in payload.sub_groups:
        sub_group = LMSMentoringSubGroup(
            schedule_id=schedule.schedule_id,
            sub_group_name=sg_data.sub_group_name,
            location=sg_data.location,
            created_by=user_id,
            created_date=datetime.now(),
        )
        db.add(sub_group)
        db.commit()
        db.refresh(sub_group)

        for slot in sg_data.dates:
            date_record = LMSMentoringSubGrpDate(
                sub_group_id=sub_group.sub_group_id,
                start_date=_parse_date(slot.start_date),
                end_date=_parse_date(slot.end_date),
                start_time=_parse_time(slot.start_time),
                end_time=_parse_time(slot.end_time),
                status=True,
                created_by=user_id,
                created_date=datetime.now(),
            )
            db.add(date_record)

        for student_id in sg_data.mentee_ids:
            mentee_map = LMSMentoringSubGrpMentee(
                sub_group_id=sub_group.sub_group_id,
                schedule_id=schedule.schedule_id,
                student_id=student_id,
                created_by=user_id,
                created_date=datetime.now(),
            )
            db.add(mentee_map)

    db.commit()

    return returnSuccess({"schedule_id": schedule.schedule_id})


# ---------------------------------------------------------------------------
# 6. GET /get_mentoring_sessions
# ---------------------------------------------------------------------------
@router.get("/get_mentoring_sessions")
def get_mentoring_sessions(db: Session = Depends(get_db)):
    """Returns all mentoring sessions."""
    schedules = (
        db.query(LMSMentoringSchedule)
        .order_by(LMSMentoringSchedule.schedule_id.desc())
        .all()
    )

    data = []
    for s in schedules:
        term = db.query(LMSMentorsGroupTerms).filter(
            LMSMentorsGroupTerms.mentors_group_terms_id == s.mentors_group_terms_id
        ).first()

        group = (
            db.query(LMSMentorsGroup)
            .filter(LMSMentorsGroup.mentors_group_id == term.mentors_group_id)
            .first()
        ) if term else None

        sub_groups = (
            db.query(LMSMentoringSubGroup)
            .filter(LMSMentoringSubGroup.schedule_id == s.schedule_id)
            .all()
        )

        sg_list = []
        for sg in sub_groups:
            dates = (
                db.query(LMSMentoringSubGrpDate)
                .filter(LMSMentoringSubGrpDate.sub_group_id == sg.sub_group_id)
                .all()
            )
            sg_list.append(
                {
                    "sub_group_id": sg.sub_group_id,
                    "sub_group_name": sg.sub_group_name,
                    "location": sg.location,
                    "dates": [
                        {
                            "start_date": str(d.start_date),
                            "end_date": str(d.end_date),
                            "start_time": str(d.start_time),
                            "end_time": str(d.end_time),
                        }
                        for d in dates
                    ]
                }
            )

        # Fetch mentors for this group
        mentor_names = []
        if term:
            mentor_rows = (
                db.query(LMSGroupMentors)
                .filter(LMSGroupMentors.mentors_group_terms_id == s.mentors_group_terms_id)
                .all()
            )
            for mr in mentor_rows:
                m_user = db.query(IEMSUsers).filter(IEMSUsers.id == mr.mentor_id).first()
                if m_user:
                    name = f"{m_user.first_name or ''} {m_user.last_name or ''}".strip() or m_user.username
                    mentor_names.append(name)

        data.append(
            {
                "schedule_id": s.schedule_id,
                "academic_batch_id": term.academic_batch_id if term else None,
                "group_name": group.mentors_pgm_title if group else None,
                "semester_id": term.semester_id if term else None,
                "questionnaire_id": s.questionnaire_id,
                "session_agenda": s.session_agenda,
                "sub_groups": sg_list,
                "mentor_names": mentor_names,
            }
        )

    return returnSuccess(data)


# ---------------------------------------------------------------------------
# 7. GET /get_session_mentees/{schedule_id}
# ---------------------------------------------------------------------------
@router.get("/get_session_mentees/{schedule_id}")
def get_session_mentees(
    schedule_id: int,
    db: Session = Depends(get_db),
):
    """Returns all mentees registered under the selected mentoring session."""
    mentee_maps = (
        db.query(LMSMentoringSubGrpMentee)
        .filter(LMSMentoringSubGrpMentee.schedule_id == schedule_id)
        .all()
    )

    data = []
    for m in mentee_maps:
        sg = db.query(LMSMentoringSubGroup).filter(
            LMSMentoringSubGroup.sub_group_id == m.sub_group_id
        ).first()
        sub_group_name = sg.sub_group_name if sg else ""

        student = db.query(Student).filter(
            Student.erp_student_id == m.student_id
        ).first()
        student_user = db.query(IEMSUsers).filter(IEMSUsers.id == m.student_id).first() if not student else None

        student_name = ""
        regno = ""
        if student:
            student_name = (
                student.full_name
                or f"{student.first_name or ''} {student.last_name or ''}".strip()
            )
            regno = student.erp_student_usn or ""
        elif student_user:
            student_name = (
                f"{student_user.first_name or ''} {student_user.last_name or ''}".strip()
                or student_user.username
            )
            regno = ""

        data.append(
            {
                "student_id": m.student_id,
                "student_name": student_name,
                "regno": regno,
                "sub_group_name": sub_group_name,
            }
        )

    return returnSuccess(data)


# ---------------------------------------------------------------------------
# 8. PUT /update_mentoring_session/{schedule_id}
# ---------------------------------------------------------------------------
@router.put("/update_mentoring_session/{schedule_id}")
def update_mentoring_session(
    schedule_id: int,
    payload: SessionPayload,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates an existing mentoring session."""
    user_id = current_user.get("user_id")
    schedule = db.query(LMSMentoringSchedule).filter(
        LMSMentoringSchedule.schedule_id == schedule_id
    ).first()
    if not schedule:
        return returnException("Session not found")

    group = db.query(LMSMentorsGroup).filter(
        LMSMentorsGroup.mentors_group_id == payload.mentors_group_id,
        LMSMentorsGroup.academic_batch_id == payload.academic_batch_id,
    ).first()
    if not group:
        return returnException("Invalid mentoring group selected")

    group_term = db.query(LMSMentorsGroupTerms).filter(
        LMSMentorsGroupTerms.mentors_group_id == payload.mentors_group_id,
        LMSMentorsGroupTerms.semester_id == payload.semester_id,
        LMSMentorsGroupTerms.academic_batch_id == payload.academic_batch_id,
    ).first()
    if not group_term:
        return returnException("Selected semester is not mapped to group")

    # Duplicate mentee check (exclude this session's own previous mappings)
    all_mentee_ids: List[int] = []
    for sg in payload.sub_groups:
        all_mentee_ids.extend(sg.mentee_ids)

    if all_mentee_ids:
        existing_mappings = (
            db.query(LMSMentoringSubGrpMentee)
            .filter(
                LMSMentoringSubGrpMentee.student_id.in_(all_mentee_ids),
                LMSMentoringSubGrpMentee.schedule_id != schedule_id,
            )
            .all()
        )
        if existing_mappings:
            duplicate_ids = list({m.student_id for m in existing_mappings})
            return returnException(
                f"Mentees already mapped to another session : {duplicate_ids}"
            )

    # Date & Time range checks
    for sg in payload.sub_groups:
        for d in sg.dates:
            start_date = _parse_date(d.start_date)
            end_date = _parse_date(d.end_date)
            start_time = _parse_time(d.start_time)
            end_time = _parse_time(d.end_time)

            if start_date > end_date:
                return returnException("Start date cannot be greater than end date")
            if start_time >= end_time:
                return returnException("Start time must be less than end time")

    # Delete old records
    old_sub_groups = db.query(LMSMentoringSubGroup).filter(
        LMSMentoringSubGroup.schedule_id == schedule_id
    ).all()

    for old_sg in old_sub_groups:
        db.query(LMSMentoringSubGrpDate).filter(
            LMSMentoringSubGrpDate.sub_group_id == old_sg.sub_group_id
        ).delete(synchronize_session=False)

        db.query(LMSMentoringSubGrpMentee).filter(
            LMSMentoringSubGrpMentee.sub_group_id == old_sg.sub_group_id
        ).delete(synchronize_session=False)

    db.query(LMSMentoringSubGroup).filter(
        LMSMentoringSubGroup.schedule_id == schedule_id
    ).delete(synchronize_session=False)

    # Update Schedule
    schedule.mentors_group_terms_id = group_term.mentors_group_terms_id
    schedule.questionnaire_id = group.questionnaire_id
    schedule.session_agenda = payload.session_agenda
    schedule.modified_by = user_id
    schedule.modified_date = datetime.now()
    db.commit()

    # Recreate Subgroups, Dates, Mentees
    for sg_data in payload.sub_groups:
        sub_group = LMSMentoringSubGroup(
            schedule_id=schedule_id,
            sub_group_name=sg_data.sub_group_name,
            location=sg_data.location,
            created_by=user_id,
            created_date=datetime.now(),
        )
        db.add(sub_group)
        db.commit()
        db.refresh(sub_group)

        for slot in sg_data.dates:
            date_record = LMSMentoringSubGrpDate(
                sub_group_id=sub_group.sub_group_id,
                start_date=_parse_date(slot.start_date),
                end_date=_parse_date(slot.end_date),
                start_time=_parse_time(slot.start_time),
                end_time=_parse_time(slot.end_time),
                status=True,
                created_by=user_id,
                created_date=datetime.now(),
            )
            db.add(date_record)

        for student_id in sg_data.mentee_ids:
            mentee_map = LMSMentoringSubGrpMentee(
                sub_group_id=sub_group.sub_group_id,
                schedule_id=schedule_id,
                student_id=student_id,
                created_by=user_id,
                created_date=datetime.now(),
            )
            db.add(mentee_map)

    db.commit()

    return returnSuccess(None, "Session updated successfully")


# ---------------------------------------------------------------------------
# 9. DELETE /delete_mentoring_session/{schedule_id}
# ---------------------------------------------------------------------------
@router.delete("/delete_mentoring_session/{schedule_id}")
def delete_mentoring_session(
    schedule_id: int,
    db: Session = Depends(get_db),
):
    """Deletes a mentoring session and related subgroups, dates and mentees."""
    schedule = db.query(LMSMentoringSchedule).filter(
        LMSMentoringSchedule.schedule_id == schedule_id
    ).first()
    if not schedule:
        return returnException("Session not found")

    sub_groups = db.query(LMSMentoringSubGroup).filter(
        LMSMentoringSubGroup.schedule_id == schedule_id
    ).all()

    for sg in sub_groups:
        db.query(LMSMentoringSubGrpDate).filter(
            LMSMentoringSubGrpDate.sub_group_id == sg.sub_group_id
        ).delete(synchronize_session=False)

        db.query(LMSMentoringSubGrpMentee).filter(
            LMSMentoringSubGrpMentee.sub_group_id == sg.sub_group_id
        ).delete(synchronize_session=False)

    db.query(LMSMentoringSubGroup).filter(
        LMSMentoringSubGroup.schedule_id == schedule_id
    ).delete(synchronize_session=False)

    db.delete(schedule)
    db.commit()

    return returnSuccess(None, "Session deleted successfully")
