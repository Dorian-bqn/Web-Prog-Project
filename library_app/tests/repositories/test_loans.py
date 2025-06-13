import pytest
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from src.models.loans import Loan
from src.models.books import Book
from src.models.users import User
from src.repositories.loans import LoanRepository
from src.repositories.books import BookRepository
from src.repositories.users import UserRepository

def create_user_and_book(db_session):
    user = User(
        email="loanrepo@example.com",
        hashed_password="hashed_password",
        full_name="Loan Repo User",
        is_active=True
    )
    db_session.add(user)
    book = Book(
        title="Loan Repo Book",
        author="Loan Author",
        isbn="9999999999999",
        publication_year=2022,
        quantity=2
    )
    db_session.add(book)
    db_session.commit()
    db_session.refresh(user)
    db_session.refresh(book)
    return user, book

def test_create_loan(db_session: Session):
    """
    Teste la création d'un emprunt.
    """
    loan_repository = LoanRepository(Loan, db_session)
    user, book = create_user_and_book(db_session)

    loan_data = {
        "user_id": user.id,
        "book_id": book.id,
        "loan_date": datetime.utcnow(),
        "due_date": datetime.utcnow() + timedelta(days=14),
        "return_date": None,
        "extended": False
    }
    loan = loan_repository.create(obj_in=loan_data)
    assert loan.id is not None
    assert loan.user_id == user.id
    assert loan.book_id == book.id
    assert loan.return_date is None

def test_get_active_loans(db_session: Session):
    """
    Teste la récupération des emprunts actifs.
    """
    loan_repository = LoanRepository(Loan, db_session)
    user, book = create_user_and_book(db_session)
    loan = Loan(
        user_id=user.id,
        book_id=book.id,
        loan_date=datetime.utcnow(),
        due_date=datetime.utcnow() + timedelta(days=7),
        return_date=None,
        extended=False
    )
    db_session.add(loan)
    db_session.commit()
    active_loans = loan_repository.get_active_loans()
    assert any(l.id == loan.id for l in active_loans)

def test_get_loans_by_user(db_session: Session):
    """
    Teste la récupération des emprunts d'un utilisateur.
    """
    loan_repository = LoanRepository(Loan, db_session)
    user, book = create_user_and_book(db_session)
    loan = Loan(
        user_id=user.id,
        book_id=book.id,
        loan_date=datetime.utcnow(),
        due_date=datetime.utcnow() + timedelta(days=7),
        return_date=None,
        extended=False
    )
    db_session.add(loan)
    db_session.commit()
    user_loans = loan_repository.get_loans_by_user(user_id=user.id)
    assert len(user_loans) >= 1
    assert user_loans[0].user_id == user.id

def test_get_loans_by_book(db_session: Session):
    """
    Teste la récupération des emprunts d'un livre.
    """
    loan_repository = LoanRepository(Loan, db_session)
    user, book = create_user_and_book(db_session)
    loan = Loan(
        user_id=user.id,
        book_id=book.id,
        loan_date=datetime.utcnow(),
        due_date=datetime.utcnow() + timedelta(days=7),
        return_date=None,
        extended=False
    )
    db_session.add(loan)
    db_session.commit()
    book_loans = loan_repository.get_loans_by_book(book_id=book.id)
    assert len(book_loans) >= 1
    assert book_loans[0].book_id == book.id

def test_get_overdue_loans(db_session: Session):
    """
    Teste la récupération des emprunts en retard.
    """
    loan_repository = LoanRepository(Loan, db_session)
    user, book = create_user_and_book(db_session)
    overdue_loan = Loan(
        user_id=user.id,
        book_id=book.id,
        loan_date=datetime.utcnow() - timedelta(days=21),
        due_date=datetime.utcnow() - timedelta(days=7),
        return_date=None,
        extended=False
    )
    db_session.add(overdue_loan)
    db_session.commit()
    overdue_loans = loan_repository.get_overdue_loans()
    assert any(l.id == overdue_loan.id for l in overdue_loans)