from typing import Optional
from fastapi import Header
def get_current_user_optional(authorization: Optional[str] = Header(default=None)):
    return None  # plug JWT later if needed
