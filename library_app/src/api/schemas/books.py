from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class BookBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="Titre du livre")
    author: str = Field(..., min_length=1, max_length=100, description="Auteur du livre")
    isbn: str = Field(..., min_length=10, max_length=13, description="ISBN du livre")
    publication_year: int = Field(..., ge=1000, le=datetime.now().year, description="Année de publication")
    description: Optional[str] = Field(None, max_length=1000, description="Description du livre")
    quantity: int = Field(..., ge=0, description="Nombre d'exemplaires disponibles")


class BookCreate(BookBase):
    title: str
    author: str
    isbn: str
    publication_year: int
    description: Optional[str] = None
    quantity: int
    publisher: Optional[str] = None
    language: Optional[str] = None
    pages: Optional[int] = None


class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100, description="Titre du livre")
    author: Optional[str] = Field(None, min_length=1, max_length=100, description="Auteur du livre")
    isbn: Optional[str] = Field(None, min_length=10, max_length=13, description="ISBN du livre")
    publication_year: Optional[int] = Field(None, ge=1000, le=datetime.now().year, description="Année de publication")
    description: Optional[str] = Field(None, max_length=1000, description="Description du livre")
    quantity: Optional[int] = Field(None, ge=0, description="Nombre d'exemplaires disponibles")


class BookInDBBase(BookBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Book(BookInDBBase):
    pass