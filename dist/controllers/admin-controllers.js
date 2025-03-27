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
exports.getRevenueOverview = exports.getUsersAnalytics = exports.getAnalytics = exports.getAdminDetails = exports.deleteAdminProfilePicture = exports.resetAdminPassword = exports.updateAdminProfile = exports.addNewAdmin = exports.removeFromSuperAdmin = exports.makeSuperAdmin = exports.getAllAdmins = void 0;
const admin_1 = require("../nobox/record-structures/admin");
const http_errors_1 = __importDefault(require("http-errors"));
const variables_1 = require("../lib/variables");
const schemas_1 = require("../schemas");
const dotenv_1 = require("dotenv");
const utils_1 = require("../lib/utils");
const admin_2 = require("../data/admin");
const password_utils_1 = require("../lib/password-utils");
const zod_1 = require("zod");
const html_templates_1 = require("../lib/html-templates");
const mail_1 = require("../data/mail");
const user_1 = require("../nobox/record-structures/user");
const user_2 = require("../data/user");
const ride_1 = require("../data/ride");
const payout_1 = require("../data/payout");
(0, dotenv_1.config)();
const getAllAdmins = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { page } = req.query;
    const currentPage = Math.max(1, Number(page) || 1);
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    ;
    const pageSize = 15;
    const options = (0, utils_1.adminPaginationOptions)(currentPage, pageSize);
    try {
        const admins = yield admin_1.AdminModel.find({}, options);
        if (!admins) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const adminsWithoutPassword = admins.map(admin => {
            return (0, utils_1.userHandler)(admin);
        });
        const filteredAdmins = adminsWithoutPassword.filter(admin => admin.id !== userId);
        const data = (0, utils_1.getUserPageInfo)(filteredAdmins, pageSize, currentPage, "admins");
        res.json({
            status: "success",
            message: "Admins found successfully",
            data
        });
    }
    catch (error) {
        console.error(`Unable to find all admins: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getAllAdmins = getAllAdmins;
const makeSuperAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const id = req.params.id;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    ;
    if (userId === id) {
        return next((0, http_errors_1.default)("You can not make yourself a super admin"));
    }
    try {
        const [superAdmin, admin] = yield Promise.all([
            (0, admin_2.findAdminById)(userId),
            (0, admin_2.findAdminById)(id),
        ]);
        if (!superAdmin) {
            return next((0, http_errors_1.default)(404, "User not found."));
        }
        if (!admin) {
            return next((0, http_errors_1.default)(404, "Admin not found."));
        }
        if (superAdmin.role !== admin_1.AdminRole.SUPER_ADMIN) {
            return next((0, http_errors_1.default)(403, "You need super admin privileges to perform this action."));
        }
        if (admin.role === admin_1.AdminRole.SUPER_ADMIN) {
            return next((0, http_errors_1.default)(400, "The user is already a super admin."));
        }
        const updatedAdmin = yield admin_1.AdminModel.updateOneById(id, {
            role: admin_1.AdminRole.SUPER_ADMIN
        });
        if (!updatedAdmin) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const { text, template, subject } = (0, html_templates_1.superAdminPromotionEmailTemplate)(updatedAdmin.personalEmail);
        yield (0, mail_1.sendEmail)(updatedAdmin.personalEmail, subject, text, template);
        res.json({
            status: "success",
            message: "User made a super admin successfully",
            user: (0, utils_1.userHandler)(updatedAdmin)
        });
    }
    catch (error) {
        console.error(`Unable to make admin a super admin: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.makeSuperAdmin = makeSuperAdmin;
const removeFromSuperAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const id = req.params.id;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    ;
    if (userId === id) {
        return next((0, http_errors_1.default)("You can not remove yourself as a super admin"));
    }
    try {
        const [superAdmin, admin] = yield Promise.all([
            (0, admin_2.findAdminById)(userId),
            (0, admin_2.findAdminById)(id),
        ]);
        if (!superAdmin) {
            return next((0, http_errors_1.default)(404, "User not found."));
        }
        if (!admin) {
            return next((0, http_errors_1.default)(404, "Admin not found."));
        }
        if (superAdmin.role !== admin_1.AdminRole.SUPER_ADMIN) {
            return next((0, http_errors_1.default)(403, "You need super admin privileges to perform this action."));
        }
        if (admin.role === admin_1.AdminRole.ADMIN) {
            return next((0, http_errors_1.default)(400, "The user is not a super admin"));
        }
        const updatedAdmin = yield admin_1.AdminModel.updateOneById(id, {
            role: admin_1.AdminRole.ADMIN
        });
        if (!updatedAdmin) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const { text, template, subject } = (0, html_templates_1.superAdminDemotionEmailTemplate)(updatedAdmin.personalEmail);
        yield (0, mail_1.sendEmail)(updatedAdmin.personalEmail, subject, text, template);
        res.json({
            status: "success",
            message: "User removed as super admin successfully",
            user: (0, utils_1.userHandler)(updatedAdmin)
        });
    }
    catch (error) {
        console.error(`Unable to remove user from super admin: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.removeFromSuperAdmin = removeFromSuperAdmin;
const addNewAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const values = req.body;
    const userId = req.userId;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    ;
    try {
        const superAdmin = yield (0, admin_2.findAdminById)(userId);
        if (!superAdmin) {
            return next((0, http_errors_1.default)(404, "User not found"));
        }
        if (superAdmin.role !== admin_1.AdminRole.SUPER_ADMIN) {
            return next((0, http_errors_1.default)(403, "You need super admin privileges to perform this action."));
        }
        const validatedData = schemas_1.AddNewAdminSchema.parse(values);
        const password = process.env.NEW_ADMIN_PASSWORD;
        if (!password) {
            return next((0, http_errors_1.default)(400, "New admin password is required in the environment variable"));
        }
        const { personalEmail, phone, name, workEmail } = validatedData;
        const uniqueError = yield (0, admin_2.validateUniqueAdminIdentifiers)(personalEmail.toLowerCase(), phone);
        if (uniqueError) {
            return next((0, http_errors_1.default)(400, uniqueError));
        }
        const hashedPassword = yield (0, password_utils_1.hashPassword)(password);
        const data = Object.assign(Object.assign({}, validatedData), { password: hashedPassword, personalEmail: personalEmail.toLowerCase(), workEmail: workEmail.toLowerCase(), name: name.toLowerCase() });
        const admin = yield (0, admin_2.createAdmin)(Object.assign(Object.assign({}, data), { role: admin_1.AdminRole.ADMIN, adminViewable: true }));
        const { text, template, subject } = (0, html_templates_1.newAdminEmailTemplate)(admin.personalEmail, password);
        yield (0, mail_1.sendEmail)(admin.personalEmail, subject, text, template);
        res.status(201).json({ status: "success", message: "New admin added successfully", admin: (0, utils_1.userHandler)(admin) });
    }
    catch (error) {
        console.error(`Unable to add new admin: ${error}`);
        if (error instanceof zod_1.ZodError) {
            const errors = (0, utils_1.zodErrorHandler)(error);
            res.status(400).json({
                success: false,
                error: errors,
            });
            return;
        }
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.addNewAdmin = addNewAdmin;
const updateAdminProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const values = req.body;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    try {
        const validatedData = schemas_1.UpdateAdminProfileSchema.parse(values);
        if (!validatedData || Object.keys(validatedData).length < 1)
            return next((0, http_errors_1.default)(400, "At least one field must be provided."));
        const admin = yield (0, admin_2.findAdminById)(userId);
        if (!admin) {
            return next((0, http_errors_1.default)(404, "User not found"));
        }
        const { personalEmail, phone, name, avatarUrl } = validatedData;
        if (personalEmail || phone) {
            const uniqueError = yield (0, admin_2.validateUniqueAdminIdentifiers)(personalEmail, phone);
            if (uniqueError) {
                return next((0, http_errors_1.default)(400, uniqueError));
            }
        }
        if (avatarUrl && !(0, utils_1.isValidImage)(avatarUrl)) {
            return next((0, http_errors_1.default)(400, "Inavlid avatar url image"));
        }
        const fieldsToUpdate = Object.fromEntries(Object.entries(validatedData).filter(([key, value]) => value !== undefined));
        const validFields = Object.assign(Object.assign(Object.assign({}, fieldsToUpdate), (personalEmail ? { personalEmail: personalEmail.toLowerCase() } : {})), (name ? { name: name.toLowerCase() } : {}));
        const updatedUser = yield admin_1.AdminModel.updateOneById(userId, validFields);
        if (!updatedUser)
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        res.status(200).json({
            status: "success",
            message: "Updated user details successfully",
            user: (0, utils_1.userHandler)(updatedUser)
        });
    }
    catch (error) {
        console.error(`Unable to update admin profile: ${error}`);
        if (error instanceof zod_1.ZodError) {
            const errors = (0, utils_1.zodErrorHandler)(error);
            res.status(400).json({
                success: false,
                error: errors,
            });
            return;
        }
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.updateAdminProfile = updateAdminProfile;
const resetAdminPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.userId;
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    if (!oldPassword || !newPassword || !confirmPassword)
        return next((0, http_errors_1.default)(400, "All fields are required."));
    if (oldPassword.length < 6 || newPassword.length < 6 || confirmPassword.length < 6)
        return next((0, http_errors_1.default)(400, "All fields must be at least 6 characters long."));
    if (newPassword !== confirmPassword)
        return next((0, http_errors_1.default)(400, "New password and confirm password do not match."));
    try {
        const admin = yield (0, admin_2.findAdminById)(userId);
        if (!admin)
            return next((0, http_errors_1.default)(404, "User not found."));
        const isOldPasswordCorrect = yield (0, password_utils_1.validatePassword)(oldPassword, admin.password);
        if (!isOldPasswordCorrect)
            return next((0, http_errors_1.default)(400, "The old password you entered is incorrect."));
        const isPasswordTheSameAsLastOne = yield (0, password_utils_1.validatePassword)(newPassword, admin.password);
        if (isPasswordTheSameAsLastOne)
            return next((0, http_errors_1.default)(400, "New password cannot be the same as the current one"));
        const hashedPassword = yield (0, password_utils_1.hashPassword)(newPassword);
        yield admin_1.AdminModel.updateOneById(admin.id, { password: hashedPassword });
        res.status(200).json({
            status: "success",
            message: "Password changed successfully",
        });
    }
    catch (error) {
        console.error(`Unable to  reset admin password: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.resetAdminPassword = resetAdminPassword;
const deleteAdminProfilePicture = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    try {
        const admin = yield (0, admin_2.findAdminById)(userId);
        if (!admin) {
            return next((0, http_errors_1.default)(404, "User not found."));
        }
        if (!(admin === null || admin === void 0 ? void 0 : admin.avatarUrl)) {
            return next((0, http_errors_1.default)(400, "You don't have a profile picture to delete."));
        }
        const updatedAdmin = yield user_1.UserModel.updateOneById(userId, { avatarUrl: undefined });
        if (!updatedAdmin) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        ;
        res.json({
            status: "success",
            message: "Admin profile picture deleted successfully",
            user: (0, utils_1.userHandler)(updatedAdmin)
        });
    }
    catch (error) {
        console.error(`Unable to delete admin profile picture: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.deleteAdminProfilePicture = deleteAdminProfilePicture;
const getAdminDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    try {
        const admin = yield (0, admin_2.findAdminById)(userId);
        if (!admin) {
            return next((0, http_errors_1.default)(404, "User not found."));
        }
        res.json({
            status: "success",
            message: "Admin details retrieved successfully",
            user: (0, utils_1.userHandler)(admin)
        });
    }
    catch (error) {
        console.error(`Unable to get admin details: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getAdminDetails = getAdminDetails;
const getAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { filter, year } = req.query;
    let weeksAgo = 0;
    const week = Number(filter);
    if (week && week >= 1) {
        weeksAgo = Math.floor(week);
    }
    let validYear = new Date().getFullYear();
    if (year && (0, utils_1.isValidNumber)(year)) {
        validYear = Number(year);
    }
    const { yesterday, today } = (0, utils_1.getDates)();
    try {
        const [usersGrowth, ridesGrowth, day_counts, month_counts] = yield Promise.all([
            (0, user_2.getUserAnalytics)(yesterday, today),
            (0, ride_1.getRideAnalytics)(yesterday, today),
            (0, user_2.getUsersWeeklyGrowth)(weeksAgo),
            (0, payout_1.getPayoutYearlyOverview)(validYear)
        ]);
        const { totalRidesGrowth, activeRidesGrowth, completedRidesGrowth } = ridesGrowth;
        res.json({
            status: "success",
            message: "Analytics found successfully",
            data: {
                growth: {
                    users: usersGrowth,
                    total_rides: totalRidesGrowth,
                    active_rides: activeRidesGrowth,
                    completed_rides: completedRidesGrowth
                },
                day_counts,
                month_counts
            }
        });
    }
    catch (error) {
        console.error(`Unable to get analytics for admin: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getAnalytics = getAnalytics;
const getUsersAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { filter } = req.query;
    let weeksAgo = 0;
    const week = Number(filter);
    if (week && week >= 1) {
        weeksAgo = Math.floor(week);
    }
    try {
        const dayCounts = yield (0, user_2.getUsersWeeklyGrowth)(weeksAgo);
        res.json({ status: "success", message: "Users analytics found succesfully", data: dayCounts });
    }
    catch (error) {
        console.error(`Unable to get users anaylytics: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getUsersAnalytics = getUsersAnalytics;
const getRevenueOverview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { year } = req.query;
    let validYear = new Date().getFullYear();
    if (year && (0, utils_1.isValidNumber)(year)) {
        validYear = Number(year);
    }
    try {
        const monthCounts = yield (0, payout_1.getPayoutYearlyOverview)(validYear);
        res.json({ status: "success", message: "Payout overview found succesfully", data: monthCounts });
    }
    catch (error) {
        console.error(`Unable to get revenue overview: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getRevenueOverview = getRevenueOverview;
