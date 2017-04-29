/* tslint:disable */

export class AuthorizationError extends Error {
    status: 401;
    name: 'AuthorizationError';

    constructor(message?: string) {
        super();
        Object.setPrototypeOf(this, AuthorizationError.prototype);

        this.name = 'AuthorizationError';
        this.status = 401;
        this.message = (message || 'Unauthorized');
    }
}

abstract class BadRequestError extends Error {
    status: 400;

    constructor(message?: string) {
        super();
        this.name = 'BadRequestError';
        this.status = 400;
        this.message = (message || '');
    }
}

export class ValidationError extends BadRequestError {
    name: 'ValidationError';

    constructor(message?: string) {
        super(message);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype)
    }
}

export class ConflictError extends BadRequestError {
    name: 'ConflictError';

    constructor(message?: string) {
        super(message);
        this.name = 'ConflictError';
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

export class NotFoundError extends BadRequestError {
    name: 'NotFoundError';
    
    constructor(message?: string) {
        super(message);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

/* tslint:enable */
