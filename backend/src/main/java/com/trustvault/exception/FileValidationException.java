
package com.trustvault.exception;

public class FileValidationException extends RuntimeException {

    public FileValidationException(String message) {
        super(message);
    }
}
/*
Scenario	Expected status
Request body fails validation	400
Document does not exist	       404
User lacks document permission	403
Database uniqueness conflict	409
Unexpected server exception 	500
 */