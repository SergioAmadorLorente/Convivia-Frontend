import { useState } from 'react';

export interface Task {
    id?: string;
    name: string;
    description: string;
    time: string;
    date?: Date | null; // Add date field
    repeatDays: string[];
    karma: number;
    assignedUsers: any[]; // Using any for now to match existing component
}

const getNextHourString = () => {
    const now = new Date();
    const nextHour = (now.getHours() + 1) % 24;
    return `${nextHour.toString().padStart(2, '0')}:00`;
};

export const useEditTask = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTime, setSelectedTime] = useState(getNextHourString());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Initialize with today's date
    const [repeatDays, setRepeatDays] = useState<string[]>([]);
    const [karma, setKarma] = useState(0);
    const [assignedUsers, setAssignedUsers] = useState<any[]>([]);

    const [isEditing, setIsEditing] = useState(false);
    const [taskId, setTaskId] = useState<string | undefined>(undefined);
    const [instanceId, setInstanceId] = useState<string | undefined>(undefined);

    const loadTask = (task: Task & { instanceId?: string }) => {
        setTaskId(task.id);
        setInstanceId(task.instanceId);
        setName(task.name);
        setDescription(task.description);
        setSelectedTime(task.time && task.time.trim() !== '' ? task.time : getNextHourString());
        setSelectedDate(task.date || null); // Load the date
        setRepeatDays(task.repeatDays);
        setKarma(task.karma);
        setAssignedUsers(task.assignedUsers);
        setIsEditing(true);
    };

    const resetForm = () => {
        setTaskId(undefined);
        setInstanceId(undefined);
        setName('');
        setDescription('');
        setSelectedTime(getNextHourString());
        setSelectedDate(new Date()); // Reset to today's date
        setRepeatDays([]);
        setKarma(0);
        setAssignedUsers([]);
        setIsEditing(false);
    };

    const getTaskData = (): Task & { instanceId?: string } => ({
        id: taskId,
        instanceId,
        name,
        description,
        time: selectedTime,
        date: selectedDate, // Include the date
        repeatDays,
        karma,
        assignedUsers,
    });

    return {
        // State
        name, setName,
        description, setDescription,
        selectedTime, setSelectedTime,
        selectedDate, setSelectedDate, // Export the date state
        repeatDays, setRepeatDays,
        karma, setKarma,
        assignedUsers, setAssignedUsers,
        isEditing,
        taskId,
        instanceId,

        // Actions
        loadTask,
        resetForm,
        getTaskData
    };
};
