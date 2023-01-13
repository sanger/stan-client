import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import LabelCopyButton from '../../../src/components/LabelCopyButton';

afterEach(() => {
  cleanup();
});

Object.assign(navigator, { clipboard: { writeText: jest.fn().mockImplementation(() => Promise.resolve('yay')) } });
describe('LabelCopyButton', () => {
  it('renders label copy button with icon', () => {
    render(<LabelCopyButton labels={['Label 1', 'Label 2', 'Label 3']} />);

    // Shows the button
    expect(screen.getByTestId('copyButton')).toBeInTheDocument();
    // displays copy icon the button
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
  });

  it('renders label copy button with icon and label', () => {
    render(<LabelCopyButton labels={['Label 1', 'Label 2', 'Label 3']} copyButtonText={'Copy Labels'} />);
    // Shows the button
    expect(screen.getByRole('button', { name: /Copy Labels/i })).toBeInTheDocument();
    // displays copy icon the button
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
  });

  it('should call clipboard.writeText on click', async () => {
    const onCopy = jest.fn();
    jest.spyOn(navigator.clipboard, 'writeText');
    act(() => {
      render(
        <LabelCopyButton
          labels={['Label 1', 'Label 2', 'Label 3']}
          copyButtonText={'Copy Labels'}
          onCopyAction={onCopy}
        />
      );
    });
    //Invoke click
    await fireEvent.click(screen.getByTestId('copyButton'));

    //Clipboard function is called
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Label 1,Label 2,Label 3');

    //Callback function is called
    expect(onCopy).toHaveBeenCalledWith(true, 'Label 1,Label 2,Label 3');
  });

  it('should call callback function showing failure if clipboard writing failed ', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: () => {
          throw 'error';
        }
      }
    });
    jest.spyOn(navigator.clipboard, 'writeText');
    const onCopy = jest.fn();
    act(() => {
      render(
        <LabelCopyButton
          labels={['Label 1', 'Label 2', 'Label 3']}
          copyButtonText={'Copy Labels'}
          onCopyAction={onCopy}
        />
      );
    });

    //Invoke click button
    await fireEvent.click(screen.getByTestId('copyButton'));

    //Clipboard function is called
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Label 1,Label 2,Label 3');
    //Callback function called with correct params
    expect(onCopy).toHaveBeenCalledWith(false, 'Label 1,Label 2,Label 3');
  });
});
