"use client";
import { useActionState } from 'react';
import { updateProfile } from 'app/profile/actions';
import Image from 'next/image';

export default function ProfileForm({ user }: { user: any }) {
  const [message, formAction] = useActionState(updateProfile, null);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/3 flex flex-col items-center">
        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-neutral-200 dark:border-neutral-800 mb-4">
          <Image src={user.profilePic || "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"} alt="Profile" fill className="object-cover" />
        </div>
      </div>
      <div className="w-full md:w-2/3">
        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input name="name" type="text" defaultValue={user.name} required className="w-full border rounded-lg p-2 dark:bg-neutral-900 dark:border-neutral-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email (Cannot be changed)</label>
            <input name="email" type="email" defaultValue={user.email} disabled className="w-full border rounded-lg p-2 bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:border-neutral-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Profile Picture URL</label>
            <input name="profilePic" type="url" defaultValue={user.profilePic || ""} className="w-full border rounded-lg p-2 dark:bg-neutral-900 dark:border-neutral-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password (leave blank to keep current)</label>
            <input name="newPassword" type="password" placeholder="••••••••" className="w-full border rounded-lg p-2 dark:bg-neutral-900 dark:border-neutral-800" />
          </div>
          {message && <p className={message === "Success" ? "text-green-500 text-sm" : "text-red-500 text-sm"}>{message === "Success" ? "Profile updated successfully!" : message}</p>}
          <button type="submit" className="w-max bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition mt-2">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}
