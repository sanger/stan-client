import { graphql, http, HttpResponse } from 'msw';
import { FindFilesQuery, FindFilesQueryVariables } from '../../types/sdk';
import fileRepository from '../repositories/fileRepository';

const CURRENT_USER_KEY = 'currentUser';
const fileHandlers = [
  //Upload
  http.post('/files', () => {
    const currentUser = sessionStorage.getItem(CURRENT_USER_KEY);
    if (!currentUser) {
      return HttpResponse.json({ data: { message: 'Not Authorized' } }, { status: 403 });
    }
    return HttpResponse.json({ data: { message: 'OK' } }, { status: 200 });
  }),

  http.post('/register/original', () => {
    return HttpResponse.json(
      {
        labwareSolutions: [
          { barcode: 'STAN-3111', solution: 'Solution 1' },
          { barcode: 'STAN-3112', solution: 'Solution 2' }
        ]
      },
      { status: 200 }
    );
  }),

  //Query files
  graphql.query<FindFilesQuery, FindFilesQueryVariables>('FindFiles', (req) => {
    const files = fileRepository.findAll().map((file) => {
      return {
        ...file,
        work: {
          workNumber: req.variables.workNumbers[Math.floor(Math.random() * req.variables.workNumbers.length)]
        }
      };
    });
    return HttpResponse.json({ data: { listFiles: files } }, { status: 200 });
  })
];

export default fileHandlers;
