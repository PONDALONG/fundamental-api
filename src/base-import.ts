import { User } from "./user/entities/user.entity";
import { StudentExercise } from "./student-exercise/entities/student-exercise.entity";
import { Room } from "./room/entities/room.entity";
import { Exercise } from "./exercise/entities/exercise.entity";
import { StudentRoom } from "./student-room/entities/student-room.entity";
import { UserController } from "./user/user.controller";
import { RoomController } from "./room/room.controller";
import { StudentRoomController } from "./student-room/student-room.controller";
import { ExerciseController } from "./exercise/exercise.controller";
import { StudentExerciseController } from "./student-exercise/student-exercise.controller";
import { UserService } from "./user/user.service";
import { RoomService } from "./room/room.service";
import { StudentRoomService } from "./student-room/student-room.service";
import { ExerciseService } from "./exercise/exercise.service";
import { StudentExerciseService } from "./student-exercise/student-exercise.service";
import { AuthService } from "./auth/auth.service";
import { FileResource } from "./file-resource/entities/file-resource.entity";
import { FileResourceService } from "./file-resource/file-resource.service";
import { FileResourceController } from "./file-resource/file-resource.controller";

export const BaseImport = [];

export const ImportEntities = [
  User,
  Room,
  StudentRoom,
  Exercise,
  StudentExercise,
  FileResource
];
export const ImportControllers = [
  UserController,
  RoomController,
  StudentRoomController,
  ExerciseController,
  StudentExerciseController,
  FileResourceController
];

export const ImportServices = [
  RoomService,
  StudentRoomService,
  UserService,
  ExerciseService,
  StudentExerciseService,
  AuthService,
  FileResourceService
];
