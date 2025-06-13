import pytest
from sqlalchemy.orm import Session

from src.models.users import User
from src.repositories.users import UserRepository

def test_create_user(db_session: Session):
    """
    Teste la création d'un utilisateur.
    """
    repository = UserRepository(User, db_session)
    user_data = {
        "email": "testuser@example.com",
        "hashed_password": "hashed_password",
        "full_name": "Test User",
        "is_active": True
    }
    user = repository.create(obj_in=user_data)
    assert user.id is not None
    assert user.email == "testuser@example.com"
    assert user.full_name == "Test User"

def test_get_user_by_id(db_session: Session):
    """
    Teste la récupération d'un utilisateur par ID.
    """
    repository = UserRepository(User, db_session)
    user_data = {
        "email": "getuser@example.com",
        "hashed_password": "hashed_password",
        "full_name": "Get User",
        "is_active": True
    }
    user = repository.create(obj_in=user_data)
    fetched = repository.get(id=user.id)
    assert fetched is not None
    assert fetched.email == user_data["email"]

def test_get_user_by_email(db_session: Session):
    """
    Teste la récupération d'un utilisateur par email.
    """
    repository = UserRepository(User, db_session)
    user_data = {
        "email": "findme@example.com",
        "hashed_password": "hashed_password",
        "full_name": "Find Me",
        "is_active": True
    }
    repository.create(obj_in=user_data)
    user = repository.get_by_email(email="findme@example.com")
    assert user is not None
    assert user.email == "findme@example.com"

def test_update_user(db_session: Session):
    """
    Teste la mise à jour d'un utilisateur.
    """
    repository = UserRepository(User, db_session)
    user_data = {
        "email": "updateuser@example.com",
        "hashed_password": "hashed_password",
        "full_name": "Update User",
        "is_active": True
    }
    user = repository.create(obj_in=user_data)
    update_data = {"full_name": "Updated Name"}
    updated = repository.update(db_obj=user, obj_in=update_data)
    assert updated.full_name == "Updated Name"

def test_delete_user(db_session: Session):
    """
    Teste la suppression d'un utilisateur.
    """
    repository = UserRepository(User, db_session)
    user_data = {
        "email": "deleteuser@example.com",
        "hashed_password": "hashed_password",
        "full_name": "Delete User",
        "is_active": True
    }
    user = repository.create(obj_in=user_data)
    deleted = repository.remove(id=user.id)
    assert deleted.id == user.id
    assert repository.get(id=user.id) is None