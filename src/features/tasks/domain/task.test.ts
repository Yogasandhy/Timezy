import {
  getLocalDateKey,
  parseLocalDateKey,
  shiftDateKey,
  validateTaskDraft,
} from './task';

describe('task domain', () => {
  it('trims and requires a non-empty title', () => {
    expect(validateTaskDraft({ title: '  Plan the week  ', dueDate: '2026-10-16' })).toEqual({});
    expect(validateTaskDraft({ title: '  ', dueDate: '2026-10-16' })).toEqual({
      title: 'Add a task title to continue.',
    });
  });

  it('requires a real calendar date and valid optional time', () => {
    expect(validateTaskDraft({ title: 'Review', dueDate: '2026-02-30' })).toEqual({
      dueDate: 'Choose a valid date.',
    });
    expect(validateTaskDraft({ title: 'Review', dueDate: '2026-10-16', dueTime: '24:30' })).toEqual({
      dueTime: 'Use a time between 00:00 and 23:59.',
    });
  });

  it('formats and parses dates in local calendar time, without UTC date shifts', () => {
    expect(getLocalDateKey(new Date(2026, 9, 16, 23, 59))).toBe('2026-10-16');
    const parsed = parseLocalDateKey('2026-10-16');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(9);
    expect(parsed.getDate()).toBe(16);
  });

  it('moves date keys across month and year boundaries', () => {
    expect(shiftDateKey('2026-12-31', 1)).toBe('2027-01-01');
    expect(shiftDateKey('2026-03-01', -1)).toBe('2026-02-28');
  });
});
