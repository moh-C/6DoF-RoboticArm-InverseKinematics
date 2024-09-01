// src/api/apiInterface.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';  // Adjust this to match your backend URL

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getJointAngles = async () => {
    try {
        const response = await api.get('/joint_angles');
        return response.data;
    } catch (error) {
        console.error('Error fetching joint angles:', error);
        throw error;
    }
};

export const setJointAngles = async (angles) => {
    try {
        const response = await api.post('/joint_angles', { angles });
        return response.data;
    } catch (error) {
        console.error('Error setting joint angles:', error);
        throw error;
    }
};

export const getDHParams = async () => {
    try {
        const response = await api.get('/dh_params');
        return response.data;
    } catch (error) {
        console.error('Error fetching DH parameters:', error);
        throw error;
    }
};

export const setDHParams = async (params) => {
    try {
        const response = await api.put('/dh_params', { params });
        return response.data;
    } catch (error) {
        console.error('Error setting DH parameters:', error);
        throw error;
    }
};

export const getRobotPose = async () => {
    try {
        const response = await api.get('/pose');
        return response.data;
    } catch (error) {
        console.error('Error fetching robot pose:', error);
        throw error;
    }
};

export const setRobotPose = async (pose) => {
    try {
        const response = await api.put('/pose', pose);
        return response.data;
    } catch (error) {
        console.error('Error setting robot pose:', error);
        throw error;
    }
};

export const getJointPositions = async () => {
    try {
        const response = await api.get('/joint_positions');
        return response.data;
    } catch (error) {
        console.error('Error fetching joint positions:', error);
        throw error;
    }
};

export const getHealthStatus = async () => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (error) {
        console.error('Error fetching health status:', error);
        throw error;
    }
};