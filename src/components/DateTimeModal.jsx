import { useState, useEffect } from 'react';

const DateTimeModal = ({ isOpen, onClose, onSave, initialDateTime = null }) => {
  const [dateTime, setDateTime] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reminder, setReminder] = useState('none');
  const [customReminder, setCustomReminder] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialDateTime) {
        const dateObj = new Date(initialDateTime);
        const dateStr = dateObj.toISOString().split('T')[0];
        const timeStr = dateObj.toTimeString().slice(0, 5);
        setDate(dateStr);
        setTime(timeStr);
        setDateTime(initialDateTime);
      } else {
        // Set default to tomorrow at 9 AM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        const dateStr = tomorrow.toISOString().split('T')[0];
        const timeStr = tomorrow.toTimeString().slice(0, 5);
        setDate(dateStr);
        setTime(timeStr);
        setDateTime(tomorrow.toISOString());
      }
    }
  }, [isOpen, initialDateTime]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    updateDateTime(newDate, time);
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setTime(newTime);
    updateDateTime(date, newTime);
  };

  const updateDateTime = (newDate, newTime) => {
    if (newDate && newTime) {
      const combined = new Date(`${newDate}T${newTime}`);
      setDateTime(combined.toISOString());
    }
  };

  const handleQuickSelect = (option) => {
    let targetDate = new Date();

    switch (option) {
      case 'today':
        targetDate.setHours(18, 0, 0, 0); // 6 PM today
        break;
      case 'tomorrow':
        targetDate.setDate(targetDate.getDate() + 1);
        targetDate.setHours(9, 0, 0, 0); // 9 AM tomorrow
        break;
      case 'next-week':
        targetDate.setDate(targetDate.getDate() + 7);
        targetDate.setHours(10, 0, 0, 0); // 10 AM next week
        break;
      case 'next-month':
        targetDate.setMonth(targetDate.getMonth() + 1);
        targetDate.setHours(14, 0, 0, 0); // 2 PM next month
        break;
      default:
        return;
    }

    const dateStr = targetDate.toISOString().split('T')[0];
    const timeStr = targetDate.toTimeString().slice(0, 5);
    setDate(dateStr);
    setTime(timeStr);
    setDateTime(targetDate.toISOString());
  };

  const handleSave = () => {
    if (dateTime) {
      onSave({
        dueDateTime: dateTime,
        reminder: reminder === 'custom' ? customReminder : reminder
      });
      onClose();
    }
  };

  const handleRemove = () => {
    onSave({ dueDateTime: null, reminder: 'none' });
    onClose();
  };

  if (!isOpen) return null;

  const selectedDate = new Date(dateTime);
  const isPast = selectedDate < new Date();
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isTomorrow = selectedDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

  const getDateDisplay = () => {
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    return selectedDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTimeDisplay = () => {
    return selectedDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Set Due Date & Time</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Select Buttons */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Select</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickSelect('today')}
              className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
            >
              Today 6 PM
            </button>
            <button
              onClick={() => handleQuickSelect('tomorrow')}
              className="px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
            >
              Tomorrow 9 AM
            </button>
            <button
              onClick={() => handleQuickSelect('next-week')}
              className="px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors"
            >
              Next Week
            </button>
            <button
              onClick={() => handleQuickSelect('next-month')}
              className="px-3 py-2 text-sm bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors"
            >
              Next Month
            </button>
          </div>
        </div>

        {/* Date and Time Inputs */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={handleTimeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Reminder</h4>
          <div className="space-y-3">
            {['none', '5min', '15min', '30min', '1hour', '1day', 'custom'].map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="reminder"
                  value={option}
                  checked={reminder === option}
                  onChange={(e) => setReminder(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700">
                  {option === 'none' && 'No reminder'}
                  {option === '5min' && '5 minutes before'}
                  {option === '15min' && '15 minutes before'}
                  {option === '30min' && '30 minutes before'}
                  {option === '1hour' && '1 hour before'}
                  {option === '1day' && '1 day before'}
                  {option === 'custom' && 'Custom'}
                </span>
              </label>
            ))}
            {reminder === 'custom' && (
              <div className="ml-7">
                <input
                  type="text"
                  value={customReminder}
                  onChange={(e) => setCustomReminder(e.target.value)}
                  placeholder="e.g., 2 hours before, 30 minutes before"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        {dateTime && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
            <div className={`p-4 rounded-lg border-2 ${
              isPast ? 'border-red-200 bg-red-50' :
              isToday ? 'border-orange-200 bg-orange-50' :
              'border-green-200 bg-green-50'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  isPast ? 'bg-red-500' :
                  isToday ? 'bg-orange-500' :
                  'bg-green-500'
                }`}></div>
                <span className={`text-sm font-medium ${
                  isPast ? 'text-red-800' :
                  isToday ? 'text-orange-800' :
                  'text-green-800'
                }`}>
                  {isPast ? 'Overdue' : isToday ? 'Due Today' : 'Due Later'}
                </span>
              </div>
              <p className={`font-semibold ${
                isPast ? 'text-red-800' :
                isToday ? 'text-orange-800' :
                'text-green-800'
              }`}>
                {getDateDisplay()} at {getTimeDisplay()}
              </p>
              {reminder !== 'none' && (
                <p className="text-sm text-gray-600 mt-1">
                  Reminder: {reminder === 'custom' ? customReminder : `${reminder} before`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 flex space-x-3">
          <button
            onClick={handleRemove}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Remove Due Date
          </button>
          <button
            onClick={handleSave}
            disabled={!dateTime}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Set Due Date
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeModal;
