import { graphql, rest } from 'msw';
import { FindFilesQuery, FindFilesQueryVariables } from '../../types/sdk';
import fileRepository from '../repositories/fileRepository';

const CURRENT_USER_KEY = 'currentUser';
const fileHandlers = [
  //Upload
  rest.post('/files', (req, res, ctx) => {
    const currentUser = sessionStorage.getItem(CURRENT_USER_KEY);
    if (!currentUser) {
      return res(ctx.status(403), ctx.json({ data: { message: 'Not Authorized' } }));
    }
    return res(ctx.status(200), ctx.json({ upload: 'OK' }));
  }),

  rest.post('/register/original', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        labwareSolutions: [
          { barcode: 'STAN-3111', solution: 'Solution 1' },
          { barcode: 'STAN-3112', solution: 'Solution 2' }
        ]
      })
    );
  }),

  //Query files
  graphql.query<FindFilesQuery, FindFilesQueryVariables>('FindFiles', (req, res, ctx) => {
    const files = fileRepository.findAll().map((file) => {
      return {
        ...file,
        work: {
          workNumber: req.variables.workNumbers[Math.floor(Math.random() * req.variables.workNumbers.length)]
        }
      };
    });

    return res(
      ctx.data({
        listFiles: files
      })
    );
  })
];

export default fileHandlers;
