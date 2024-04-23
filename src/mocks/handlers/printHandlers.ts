import { graphql, HttpResponse } from 'msw';
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
  memo.push({
    __typename: 'Printer',
    labelTypes: [
      {
        name: 'Label Type 1'
      }
    ],
    name: 'Label Type 1'
  });

  return memo;
}, []);

const printHandlers = [
  graphql.query<GetPrintersQuery, GetPrintersQueryVariables>('GetPrinters', ({ variables }) => {
    return HttpResponse.json({ data: { printers: printers } }, { status: 200 });
  }),

  graphql.mutation<PrintMutation, PrintMutationVariables>('Print', ({ variables }) => {
    return HttpResponse.json({ data: { printLabware: 'OK' } }, { status: 200 });
  })
];

export default printHandlers;
