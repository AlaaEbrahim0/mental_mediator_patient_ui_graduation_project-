// src/hooks/useSignalR.js
import * as signalR from "@microsoft/signalr";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/authProvider";
import { getToken } from "../auth/session";
import { API_BASE_URL } from "../api/client";
import toast from "react-hot-toast";

const url = API_BASE_URL;

export const useSignalR = (onReceiveNotification) => {
    const [connection, setConnection] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        // Read the token from the persisted session: SignalR reconnects on its
        // own and the token factory may be called long after the React state
        // that created the connection was unmounted.
        const accessTokenFactory = () => getToken() || token;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${url}/notification-hub`, {
                accessTokenFactory,
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        return () => {
            if (newConnection) {
                newConnection.stop();
            }
        };
    }, [token]);

    useEffect(() => {
        const startConnection = async () => {
            if (
                connection &&
                connection.state === signalR.HubConnectionState.Disconnected
            ) {
                try {
                    await connection.start();
                    console.log("Connected to SignalR hub");

                    connection.on("ReceiveNotification", (notification) => {
                        console.log("Notification received:", notification);
                        if (onReceiveNotification) {
                            onReceiveNotification(notification);
                            toast.success("Notification received");
                        }
                    });

                    connection.on("ReceiveMessage", (message) => {
                        console.log("Message received:", message);
                    });
                } catch (err) {
                    console.error("Error connecting to SignalR hub:", err);
                    // Implement retry logic if needed
                }
            }
        };

        if (connection) {
            startConnection();

            return () => {
                connection.off("ReceiveNotification");
                connection.off("ReceiveMessage");
                connection.stop();
            };
        }
    }, [connection, onReceiveNotification]);

    return connection;
};
