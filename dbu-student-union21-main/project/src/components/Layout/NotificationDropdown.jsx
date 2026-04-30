import React from "react";
import { Link } from "react-router-dom";
import { Bell, FileText, AlertCircle, Users, Vote, X } from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext";

export function NotificationDropdown({ isOpen, onClose }) {
    const { newItems, markAsSeen } = useNotifications();

    if (!isOpen) return null;

    const allNotifications = [
        ...newItems.posts.map(item => ({
            id: item._id,
            type: "posts",
            title: item.title,
            description: "New announcement posted",
            href: "/latest",
            icon: FileText,
            color: "text-blue-600",
            bg: "bg-blue-100"
        })),
        ...newItems.complaints.map(item => ({
            id: item._id,
            type: "complaints",
            title: item.subject || "New Complaint",
            description: "A new complaint has been submitted",
            href: "/complaints",
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-100"
        })),
        ...newItems.clubs.map(item => ({
            id: item._id,
            type: "clubs",
            title: item.name,
            description: "New club created",
            href: "/clubs",
            icon: Users,
            color: "text-green-600",
            bg: "bg-green-100"
        })),
        ...newItems.elections.map(item => ({
            id: item._id,
            type: "elections",
            title: item.title,
            description: "New election announced",
            href: "/elections",
            icon: Vote,
            color: "text-purple-600",
            bg: "bg-purple-100"
        }))
    ].sort((a, b) => (b.id || "").toString().localeCompare((a.id || "").toString())); // Safe sort

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {allNotifications.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {allNotifications.map((notif, index) => (
                            <Link
                                key={`${notif.type}-${notif.id}-${index}`}
                                to={notif.href}
                                onClick={() => {
                                    markAsSeen(notif.type);
                                    onClose();
                                }}
                                className="p-4 hover:bg-gray-50 flex items-start space-x-3 transition-colors"
                            >
                                <div className={`p-2 rounded-lg ${notif.bg}`}>
                                    <notif.icon className={`w-5 h-5 ${notif.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {notif.title}
                                    </p>
                                    <p className="text-xs text-gray-500">{notif.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No new notifications</p>
                    </div>
                )}
            </div>

            {allNotifications.length > 0 && (
                <div className="p-3 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={() => {
                            ["posts", "complaints", "clubs", "elections"].forEach(type => markAsSeen(type));
                            onClose();
                        }}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Mark all as read
                    </button>
                </div>
            )}
        </div>
    );
}
