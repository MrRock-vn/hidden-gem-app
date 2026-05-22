import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { LocationPicker } from '../components/LocationPicker';

describe('LocationPicker Component', () => {
  const mockOnLocationSelected = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    visible: true,
    onLocationSelected: mockOnLocationSelected,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByText } = render(<LocationPicker {...defaultProps} />);
    expect(getByText('Select Location')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <LocationPicker {...defaultProps} visible={false} />
    );
    expect(queryByText('Select Location')).toBeNull();
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByText } = render(<LocationPicker {...defaultProps} />);
    fireEvent.press(getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onLocationSelected when confirm button is pressed', async () => {
    const { getByText } = render(<LocationPicker {...defaultProps} />);
    
    // Simulate marker drag and selection
    fireEvent.press(getByText('Confirm'));
    
    await waitFor(() => {
      expect(mockOnLocationSelected).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.any(String),
      );
    });
  });
});

// MentionInput Tests
import { MentionInput } from '../components/MentionInput';

describe('MentionInput Component', () => {
  const mockOnChangeText = jest.fn();
  const mockOnMentionSelected = jest.fn();

  const mockUsers = [
    { id: '1', username: 'john' },
    { id: '2', username: 'jane' },
    { id: '3', username: 'bob' },
  ];

  const defaultProps = {
    value: '',
    onChangeText: mockOnChangeText,
    placeholder: 'Type a message...',
    availableUsers: mockUsers,
    onMentionSelected: mockOnMentionSelected,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input field', () => {
    const { getByPlaceholderText } = render(<MentionInput {...defaultProps} />);
    expect(getByPlaceholderText('Type a message...')).toBeTruthy();
  });

  it('shows mention dropdown when @ is typed', async () => {
    const { getByPlaceholderText, getByText } = render(
      <MentionInput {...defaultProps} />
    );

    const input = getByPlaceholderText('Type a message...');
    fireEvent.changeText(input, '@');

    await waitFor(() => {
      expect(getByText('john')).toBeTruthy();
      expect(getByText('jane')).toBeTruthy();
    });
  });

  it('filters users when typing after @', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <MentionInput {...defaultProps} />
    );

    const input = getByPlaceholderText('Type a message...');
    fireEvent.changeText(input, '@jo');

    await waitFor(() => {
      expect(getByText('john')).toBeTruthy();
      expect(queryByText('jane')).toBeNull();
    });
  });

  it('inserts mention when user is selected', async () => {
    const { getByPlaceholderText, getByText } = render(
      <MentionInput {...defaultProps} />
    );

    const input = getByPlaceholderText('Type a message...');
    fireEvent.changeText(input, '@');

    await waitFor(() => {
      expect(getByText('john')).toBeTruthy();
    });

    fireEvent.press(getByText('john'));

    expect(mockOnMentionSelected).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('hides dropdown when space is entered after @', async () => {
    const { getByPlaceholderText, queryByText } = render(
      <MentionInput {...defaultProps} />
    );

    const input = getByPlaceholderText('Type a message...');
    fireEvent.changeText(input, '@ ');

    await waitFor(() => {
      expect(queryByText('john')).toBeNull();
    });
  });
});

// DraftsModal Tests
import { DraftsModal } from '../components/DraftsModal';

describe('DraftsModal Component', () => {
  const mockOnClose = jest.fn();

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when visible', () => {
    const { getByText } = render(<DraftsModal {...defaultProps} />);
    expect(getByText(/Drafts/i)).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <DraftsModal {...defaultProps} visible={false} />
    );
    expect(queryByText(/Drafts/i)).toBeNull();
  });

  it('calls onClose when close button is pressed', () => {
    const { getByText } = render(<DraftsModal {...defaultProps} />);
    fireEvent.press(getByText('✕'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows empty state when no drafts', () => {
    const { getByText } = render(<DraftsModal {...defaultProps} />);
    expect(getByText('No drafts saved')).toBeTruthy();
  });
});

// Mentions Service Tests
import { extractMentions, getUniqueMentionedUsernames } from '../services/mentions';

describe('Mentions Service', () => {
  describe('extractMentions', () => {
    it('extracts single mention from text', () => {
      const text = 'Hey @john, check this out!';
      const mentions = extractMentions(text);
      expect(mentions).toHaveLength(1);
      expect(mentions[0].username).toBe('john');
    });

    it('extracts multiple mentions from text', () => {
      const text = '@jane and @bob, let me know what you think about @john proposal';
      const mentions = extractMentions(text);
      expect(mentions).toHaveLength(3);
    });

    it('handles mentions at different positions', () => {
      const text = '@start in @middle and at @end';
      const mentions = extractMentions(text);
      expect(mentions).toHaveLength(3);
    });

    it('returns empty array if no mentions', () => {
      const text = 'This text has no mentions';
      const mentions = extractMentions(text);
      expect(mentions).toHaveLength(0);
    });
  });

  describe('getUniqueMentionedUsernames', () => {
    it('returns unique usernames', () => {
      const text = '@john hello @john again and @jane';
      const usernames = getUniqueMentionedUsernames(text);
      expect(usernames).toHaveLength(2);
      expect(usernames).toContain('john');
      expect(usernames).toContain('jane');
    });

    it('handles duplicate mentions', () => {
      const text = '@alice @bob @alice @charlie @bob';
      const usernames = getUniqueMentionedUsernames(text);
      expect(usernames).toHaveLength(3);
      expect(new Set(usernames).size).toBe(3);
    });
  });
});
