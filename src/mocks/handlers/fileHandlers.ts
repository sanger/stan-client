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

  //Query files
  graphql.query<FindFilesQuery, FindFilesQueryVariables>('FindFiles', (req, res, ctx) => {
    return res(
      ctx.data({
        listFiles: fileRepository.findAll()
      })
    );
  })
];

export default fileHandlers;
