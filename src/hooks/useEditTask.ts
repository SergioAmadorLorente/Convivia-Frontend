import { useState } from 'react';

export interface Task {
    id?: string;
    name: string;
    description: string;
    time: string;
    repeatDays: string[];
    karma: number;
    assignedUsers: any[]; // Using any for now to match existing component
}

export const useEditTask = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTime, setSelectedTime] = useState('12:00');
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
        setSelectedTime(task.time);
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
        setSelectedTime('12:00');
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
        repeatDays,
        karma,
        assignedUsers,
    });

    return {
        // State
        name, setName,
        description, setDescription,
        selectedTime, setSelectedTime,
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
