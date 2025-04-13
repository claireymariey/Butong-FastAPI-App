from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from database import SessionLocal, engine
from models import Todo, Base
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS Middleware for allowing React frontend to access FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # for local dev
        "https://butong-fastapi-app.netlify.app",
    ]  # your deployed frontend],  # Change as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic schemas for validation
class TodoCreate(BaseModel):
    title: str
    completed: bool = False

class TodoOut(TodoCreate):
    id: int

    class Config:
        from_attributesS = True

# Create a task
@app.post("/api/todos/create/", response_model=TodoOut)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    db_todo = Todo(**todo.dict())
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

# Fetch all tasks
@app.get("/api/todos/fetch/", response_model=List[TodoOut])
def fetch_todos(db: Session = Depends(get_db)):
    return db.query(Todo).all()

@app.get("/")
def root():
    return {"message": "FastAPI backend is running."}

# Update a task
@app.put("/api/todos/{todo_id}/update/", response_model=TodoOut)
def update_todo(todo_id: int, updated: TodoCreate, db: Session = Depends(get_db)):
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    todo.title = updated.title
    todo.completed = updated.completed
    db.commit()
    db.refresh(todo)
    return todo

# Delete a task
@app.delete("/api/todos/{todo_id}/delete/")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(todo)
    db.commit()
    return {"message": "Todo deleted"}
