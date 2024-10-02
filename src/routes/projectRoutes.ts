import { Router } from "express";
import { body, param } from "express-validator";

import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import { hasAuthorization, taskBelongsToProject, taskExists } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const routes = Router();

routes.use(authenticate);

routes.get('/',
    ProjectController.getProjects
);

routes.param('projectId', projectExists);
routes.get('/:projectId',
    param('projectId').isMongoId().withMessage('El ID del proyecto es inválido'),
    handleInputErrors,
    ProjectController.getProjectById
);

routes.delete('/:projectId',
    param('projectId').isMongoId().withMessage('El ID del proyecto es inválido'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.deleteProjectsById
);

routes.put('/:projectId',
    param('projectId').isMongoId().withMessage('El ID del proyecto es inválido'),
    body('projectName').notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName').notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description').notEmpty().withMessage('La descripción del proyecto es obligatoria'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.updateProject
);

routes.post('/',
    body('projectName').notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName').notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description').notEmpty().withMessage('La descripción del proyecto es obligatoria'),
    handleInputErrors,
    ProjectController.createProject
);

/* Routes for tasks */
routes.post('/:projectId/tasks',
    param('projectId').isMongoId().withMessage('El ID del proyecto es inválido'),
    body('name').notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description').notEmpty().withMessage('La descripción de la tarea es obligatoria'),
    hasAuthorization,
    handleInputErrors,
    TaskController.createTask
);

routes.get('/:projectId/tasks',
    param('projectId').isMongoId().withMessage('El ID del proyecto es inválido'),
    handleInputErrors,
    TaskController.getProjectTasks,
);

routes.param('taskId', taskExists);
routes.param('taskId', taskBelongsToProject);
routes.get('/:projectId/tasks/:taskId',
    param('projectId').isMongoId().withMessage('El ID del proyecto es inválido'),
    param('taskId').isMongoId().withMessage('El ID del proyecto es inválido'),
    handleInputErrors,
    TaskController.getTaskById
);

routes.put('/:projectId/tasks/:taskId',
    param('projectId').isMongoId().withMessage('El ID del proyecto es inválido'),
    body('name').notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description').notEmpty().withMessage('La descripción de la tarea es obligatoria'),
    hasAuthorization,
    handleInputErrors,
    TaskController.updateTask
);

routes.delete('/:projectId/tasks/:taskId',
    param('projectId').isMongoId().withMessage('El ID del proyecto es inválido'),
    hasAuthorization,
    handleInputErrors,
    TaskController.deleteTask
);

routes.post('/:projectId/tasks/:taskId/status',
    param('projectId').isMongoId().withMessage('El ID del proyecto es inválido'),
    body('status').notEmpty().withMessage('El estado es obligatorio'),
    handleInputErrors,
    TaskController.updateStatus
);

/* Routes for teams */
routes.post('/:projectId/team/search',
    body('email').isEmail().toLowerCase().withMessage('E-mail no válido'),
    handleInputErrors,
    TeamMemberController.searchMemberByEmail
);

routes.post('/:projectId/team',
    body('id').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TeamMemberController.addMemberById
);

routes.delete('/:projectId/team/:userId',
    param('userId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TeamMemberController.removeMemberById
);

routes.get('/:projectId/team',
    param('projectId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TeamMemberController.getProjectMembers
);

/* Routes for Notes */
routes.post('/:projectId/tasks/:taskId/notes',
    body('content').notEmpty().withMessage('El contenido de la nota es obligatorio'),
    handleInputErrors,
    NoteController.createNote
);

routes.get('/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
);

routes.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    NoteController.deleteNote
);

export default routes;
