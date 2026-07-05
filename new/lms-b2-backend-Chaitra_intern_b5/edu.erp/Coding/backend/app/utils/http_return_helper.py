from fastapi.responses import JSONResponse

def returnException(msg:str, status_code:int = 400):
    return JSONResponse(
        status_code=status_code,
        content={"status":False,"message":msg,"data":None,"status_code":status_code}
    )

def returnSuccess(data:any, message:str = "Completed"):
    return {"status":True,"message":message,"data":data,"status_code":200}
