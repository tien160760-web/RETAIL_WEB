
class AppException(Exception):
    """Ngoại lệ nghiệp vụ dùng chung cho Backend."""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details=None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details

        super().__init__(message)
