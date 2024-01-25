import { graphql } from 'msw';
import { GetPrintersQuery, GetPrintersQueryVariables, PrintMutation, PrintMutationVariables } from '../../types/sdk';
import { labwareTypeInstances } from '../../lib/factories/labwareTypeFactory';

const printers = labwareTypeInstances.reduce<GetPrintersQuery['printers']>((memo, labwareType) => {
  if (labwareType.labelType?.name) {
    memo.push({
      __typename: 'Printer',
      labelTypes: [
        {
          name: labwareType.labelType.name
        }
      ],
      name: `${labwareType.name} Printer`
    });

    memo.push({
      __typename: 'Printer',
      labelTypes: [
        {
          name: labwareType.labelType.name
        }
      ],
      name: `${labwareType.name} Printer 2`
    });
  }
  return memo;
}, []);

const printHandlers = [
  graphql.query<GetPrintersQuery, GetPrintersQueryVariables>('GetPrinters', (req, res, ctx) => {
    return res(
      ctx.data({
        printers: printers
      })
    );
  }),

  graphql.mutation<PrintMutation, PrintMutationVariables>('Print', (req, res, ctx) => {
    return res(
      ctx.data({
        printLabware: 'OK'
      })
    );
  })
];

export default printHandlers;
