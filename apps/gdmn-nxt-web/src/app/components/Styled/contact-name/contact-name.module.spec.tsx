// /* eslint-disable @typescript-eslint/no-unused-expressions */
// import { render } from '@testing-library/react';
// import ContactName, { ContactNameTest } from './contact-name';
// import userEvent from '@testing-library/user-event';
// describe('NameTextField', () => {
//   it('should render successfully', () => {
//     const { baseElement } = render(<ContactName />);
//     expect(baseElement).toBeTruthy();
//   });
//   const cummonTests = (type: 'string'|'object') => {
//     const user = userEvent.setup();
//     it(type + 'Value: set main value and clear', async () => {
//       const { baseElement } = render(<ContactNameTest type={type} />);
//       await user.type(baseElement.getElementsByTagName('input')[0], 'Фамилия Имя Отчество');
//       await user.click(baseElement.getElementsByTagName('input')[0]);
//       const inputs = baseElement.getElementsByTagName('input');
//       expect(baseElement.getElementsByTagName('input')[0].value === 'Фамилия Имя Отчество').toBeTruthy();
//       expect(inputs[1].value === 'Фамилия' && inputs[2].value === 'Имя' && inputs[3].value === 'Отчество').toBeTruthy();
//       await user.clear(baseElement.getElementsByTagName('input')[0]);
//       expect(baseElement.getElementsByTagName('input')[0].value === '').toBeTruthy();
//       expect(inputs[1].value === '' && inputs[2].value === '' && inputs[3].value === '').toBeTruthy();
//     });
//     it(type + 'Value: set all values and clear', async () => {
//       const { baseElement } = render(<ContactNameTest type={type} />);
//       await user.click(baseElement.getElementsByTagName('input')[0]);
//       const inputs = baseElement.getElementsByTagName('input');
//       await user.type(inputs[1], 'Фамилия');
//       await user.type(inputs[2], 'Имя');
//       await user.type(inputs[3], 'Отчество');
//       expect(baseElement.getElementsByTagName('input')[0].value === 'Фамилия Имя Отчество').toBeTruthy();
//       expect(inputs[1].value === 'Фамилия' && inputs[2].value === 'Имя' && inputs[3].value === 'Отчество').toBeTruthy();
//       await user.clear(inputs[1]);
//       await user.clear(inputs[2]);
//       await user.clear(inputs[3]);
//       expect(baseElement.getElementsByTagName('input')[0].value === '').toBeTruthy();
//       expect(inputs[1].value === '' && inputs[2].value === '' && inputs[3].value === '').toBeTruthy();
//     });
//     it(type + 'Value: set 3 1 2 values and clear', async () => {
//       const { baseElement } = render(<ContactNameTest type={type} />);
//       await user.click(baseElement.getElementsByTagName('input')[0]);
//       const inputs = baseElement.getElementsByTagName('input');
//       await user.type(inputs[3], 'Отчество');
//       await user.type(inputs[1], 'Фамилия');
//       await user.type(inputs[2], 'Имя');
//       expect(baseElement.getElementsByTagName('input')[0].value === 'Фамилия Имя Отчество').toBeTruthy();
//       expect(inputs[1].value === 'Фамилия' && inputs[2].value === 'Имя' && inputs[3].value === 'Отчество').toBeTruthy();
//       await user.clear(inputs[3]);
//       await user.clear(inputs[1]);
//       await user.clear(inputs[2]);
//       expect(baseElement.getElementsByTagName('input')[0].value === '').toBeTruthy();
//       expect(inputs[1].value === '' && inputs[2].value === '' && inputs[3].value === '').toBeTruthy();
//     });
//     it(type + 'Value: more one space', async () => {
//       const { baseElement } = render(<ContactNameTest type={type} />);
//       await user.type(baseElement.getElementsByTagName('input')[0], 'Фамилия ещеоднастрока Имя Отчество');
//       await user.click(baseElement.getElementsByTagName('input')[0]);
//       const inputs = baseElement.getElementsByTagName('input');
//       expect(baseElement.getElementsByTagName('input')[0].value === 'Фамилия ещеоднастрока ИмяОтчество').toBeTruthy();
//       expect(inputs[1].value === 'Фамилия' && inputs[2].value === 'ещеоднастрока' && inputs[3].value === 'ИмяОтчество').toBeTruthy();
//     });
//     it(type + 'Value: open/close popup', async () => {
//       const { baseElement, getByTestId, queryByTestId } = render(<ContactNameTest type={type} />);
//       // input -> away
//       await user.click(baseElement.getElementsByTagName('input')[0]);
//       expect(getByTestId('name-text-field-popup')).toBeTruthy();
//       await user.click(document.getElementsByTagName('body')[0]);
//       expect(queryByTestId('name-text-field-popup')).not.toBeTruthy();
//       // button -> button
//       await user.click(baseElement.getElementsByTagName('button')[0]);
//       expect(getByTestId('name-text-field-popup')).toBeTruthy();
//       await user.click(document.getElementsByTagName('button')[0]);
//       expect(queryByTestId('name-text-field-popup')).not.toBeTruthy();
//       // button => away
//       await user.click(baseElement.getElementsByTagName('button')[0]);
//       expect(getByTestId('name-text-field-popup')).toBeTruthy();
//       await user.click(document.getElementsByTagName('body')[0]);
//       expect(queryByTestId('name-text-field-popup')).not.toBeTruthy();
//       // input -> button
//       await user.click(baseElement.getElementsByTagName('input')[0]);
//       expect(getByTestId('name-text-field-popup')).toBeTruthy();
//       await user.click(document.getElementsByTagName('button')[0]);
//       expect(queryByTestId('name-text-field-popup')).not.toBeTruthy();
//     });
//   };
//   cummonTests('string');
//   cummonTests('object');
// });
