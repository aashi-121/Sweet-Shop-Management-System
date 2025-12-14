"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
describe('Authentication Endpoints', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Clean up database before tests
        yield prisma.user.deleteMany();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma.$disconnect();
    }));
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'User registered successfully');
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('email', 'test@example.com');
            expect(res.body.user).not.toHaveProperty('password'); // Password should not be returned
        }));
        it('should fail if email is already registered', () => __awaiter(void 0, void 0, void 0, function* () {
            // First registration
            yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                email: 'duplicate@example.com',
                password: 'password123',
            });
            // Second registration with same email
            const res = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                email: 'duplicate@example.com',
                password: 'password123',
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error', 'Email already in use');
        }));
        it('should fail with invalid input', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                email: 'invalid-email',
                password: '123', // Too short
            });
            expect(res.statusCode).toEqual(400);
        }));
    });
});
