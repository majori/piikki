/* tslint:disable */

class BadRequestError extends Error {
    constructor(message?: string) {
        super();
        Object.setPrototypeOf(this, BadRequestError.prototype);

        this.name = 'BadRequestError';
        this.status = 400;
        this.message = (message || '');
    }
}

export class ValidationError extends BadRequestError {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, ValidationError.prototype);
        this.name = 'ValidationError';
    }
}

export class ConflictError extends BadRequestError {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, ConflictError.prototype);
        this.name = 'ConflictError';
    }
}

export class NotFoundError extends BadRequestError {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
        this.name = 'NotFoundError';
    }
}

/* tslint:enable */
