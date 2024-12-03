import React, { useState } from 'react';
import axios from 'axios';

const ProjectCreator = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [teamMembers, setTeamMembers] = useState([{ email: '', role: '' }]);
    const [error, setError] = useState<string>('');

    const handleAddMember = () => {
        setTeamMembers([...teamMembers, { email: '', role: '' }]);
    };

    const handleInputChange = (index: number, field: 'email' | 'role', value: string) => {
        const updatedTeamMembers = [...teamMembers];
        updatedTeamMembers[index][field] = value;
        setTeamMembers(updatedTeamMembers);
    };

    const handleRemoveMember = (index: number) => {
        const updatedTeamMembers = teamMembers.filter((_, i) => i !== index);
        setTeamMembers(updatedTeamMembers);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setError('');
        e.preventDefault();
        console.log({ title, description, teamMembers });

        if (!title) {
            setError('Title is required.');
            return;
        }

        if (teamMembers.some((member) => !member.email || !member.role)) {
            setError('All members fields are required.');
            return;
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_URL}/api/projects`, {
                title,
                description
            }, {
                withCredentials: true
            });

            const projectId = response.data.project_id;

            teamMembers.forEach(async (member) => {
                try {
                    await axios.post(`${import.meta.env.VITE_APP_URL}/api/project-assignments/assign/${projectId}`, {
                        email: member.email,
                        role: member.role
                    }, {
                        withCredentials: true
                    });
                } catch (error) {
                    setError('An error occurred while adding a team member. Please try again.');
                }
            });
        } catch (error) {
            setError('An error occured. Please try again.');
        }
    }

    return (
        <div className='ProejctCreator-container'>
            <div className='ProejctCreator-content'>
                <form onSubmit={handleSubmit}>
                    <input
                        type='text'
                        placeholder='Title'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <input
                        type='text'
                        placeholder='Description'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    {teamMembers.map((member, index) => (
                        <div key={index} className='team-member'>
                            <input
                                type='email'
                                placeholder='Email'
                                value={member.email}
                                onChange={(e) =>
                                    handleInputChange(index, 'email', e.target.value)
                                }
                            />
                            <select
                                value={member.role}
                                onChange={(e) =>
                                    handleInputChange(index, 'role', e.target.value)
                                }

                            >
                                <option value=''>Select role</option>
                                <option value='admin'>Admin</option>
                                <option value='member'>Member</option>
                                <option value='viewer'>Viewer</option>
                            </select>
                            <button
                                type='button'
                                onClick={() => handleRemoveMember(index)}
                                className='remove-member'
                            >
                                -
                            </button>
                        </div>
                    ))}

                    <button type='button' onClick={handleAddMember}>
                        +
                    </button>
                    <button type='submit'>Create Project</button>
                </form>
                {error && <p className='error-message'>{error}</p>}
            </div>
        </div>
    );
};

export default ProjectCreator;
