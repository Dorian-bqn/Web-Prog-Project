from sqlalchemy.orm import Session
from typing import List

from .base import BaseRepository
from ..models.books import Book

class BookRepository(BaseRepository[Book, None, None]):
    def get_by_isbn(self, *, isbn: str) -> Book:
        """
        Récupère un livre par son ISBN.
        """
        return self.db.query(Book).filter(Book.isbn == isbn).first()

    def get_by_title(self, *, title: str) -> List[Book]:
        """
        Récupère des livres par leur titre (recherche partielle).
        """
        return self.db.query(Book).filter(Book.title.ilike(f"%{title}%")).all()

    def get_by_author(self, *, author: str) -> List[Book]:
        """
        Récupère des livres par leur auteur (recherche partielle).
        """
        return self.db.query(Book).filter(Book.author.ilike(f"%{author}%")).all()

    def search(self, query: str) -> List[Book]:
        """
        Recherche des livres par titre ou auteur (recherche partielle).
        """
        return self.db.query(Book).filter(
            (Book.title.ilike(f"%{query}%")) | (Book.author.ilike(f"%{query}%"))
        ).all()