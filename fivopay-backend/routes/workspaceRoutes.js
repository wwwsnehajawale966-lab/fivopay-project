import express from 'express';
import { 
  getBoards, 
  createBoard, 
  getBoardData, 
  createList, 
  updateList,
  deleteList,
  createCard, 
  updateCard,
  deleteCard,
  moveCard,
  getUsers,
  inviteToBoard,
  getBoardMembers,
  updateBoard
} from '../controllers/workspaceController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/users', getUsers);
router.get('/boards', getBoards);
router.post('/boards', createBoard);
router.put('/boards', updateBoard);
router.post('/invite', inviteToBoard);
router.get('/board/:boardId', getBoardData);
router.get('/board/:boardId/members', getBoardMembers);

router.post('/list', createList);
router.put('/list', updateList);
router.delete('/list/:listId', deleteList);

router.post('/card', createCard);
router.put('/card', updateCard);
router.delete('/card/:cardId', deleteCard);
router.put('/card/move', moveCard);

export default router;
