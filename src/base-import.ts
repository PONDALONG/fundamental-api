import { User } from "./user/entities/user.entity";
import { StudentAssignment } from "./student-assignment/entities/student-assignment.entity";
import { Room } from "./room/entities/room.entity";
import { Assignment } from "./assignment/entities/assignment.entity";
import { Student } from "./student/entities/student.entity";
import { UserController } from "./user/user.controller";
import { RoomController } from "./room/room.controller";
import { StudentController } from "./student/student.controller";
import { AssignmentController } from "./assignment/assignment.controller";
import { StudentAssignmentController } from "./student-assignment/student-assignment.controller";
import { UserService } from "./user/user.service";
import { RoomService } from "./room/room.service";
import { StudentService } from "./student/student.service";
import { AssignmentService } from "./assignment/assignment.service";
import { StudentAssignmentService } from "./student-assignment/student-assignment.service";
import { AuthService } from "./auth/auth.service";
import { FileResource } from "./file-resource/entities/file-resource.entity";
import { FileResourceService } from "./file-resource/file-resource.service";
import { FileResourceController } from "./file-resource/file-resource.controller";

export const BaseImport = [];

export const ImportEntities = [
  User,
  Room,
  Student,
  Assignment,
  StudentAssignment,
  FileResource
];
export const ImportControllers = [
  UserController,
  RoomController,
  StudentController,
  AssignmentController,
  StudentAssignmentController,
  FileResourceController
];

export const ImportServices = [
  RoomService,
  StudentService,
  UserService,
  AssignmentService,
  StudentAssignmentService,
  AuthService,
  FileResourceService
];
