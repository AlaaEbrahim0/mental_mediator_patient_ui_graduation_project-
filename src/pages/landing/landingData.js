/**
 * Landing-page content.
 *
 * Everything here was read from the live API on 1 November 2026 and pinned so
 * the marketing page can render real community activity without a session.
 * `/api/posts` is publicly readable, so the feed below still refreshes live in
 * the browser and falls back to this snapshot only when the network fails.
 *
 * Doctor and room data is *not* anonymous on the API (401 without a token), so
 * those stay snapshots. Keep them in sync when the seed data changes.
 */

/** Community posts pulled from /api/posts. */
export const COMMUNITY_POSTS = [
  {
    "id": 1024,
    "title": "Grounding techniques that actually stuck",
    "category": "Support",
    "author": "Omar El-Sharif",
    "tags": [
      "coping",
      "panic",
      "practical"
    ],
    "likes": 3,
    "comments": 1,
    "ago": "5h ago"
  },
  {
    "id": 1025,
    "title": "Small wins: the walk I took before the call",
    "category": "Journey",
    "author": "Rami Nasser",
    "tags": [
      "progress",
      "small-steps"
    ],
    "likes": 3,
    "comments": 1,
    "ago": "7h ago"
  },
  {
    "id": 1022,
    "title": "What I wish parents understood about exam pressure",
    "category": "Guidance",
    "author": "Hana Farouk",
    "tags": [
      "students",
      "exams",
      "family"
    ],
    "likes": 3,
    "comments": 1,
    "ago": "11h ago"
  },
  {
    "id": 1020,
    "title": "Anyone else wake up at 4am with a racing mind?",
    "category": "Questions",
    "author": "Dana Hasan",
    "tags": [
      "sleep",
      "anxiety",
      "community"
    ],
    "likes": 3,
    "comments": 2,
    "ago": "15h ago"
  },
  {
    "id": 1026,
    "title": "The 3pm slump is not laziness",
    "category": "Coping",
    "author": "Sofia Nagy",
    "tags": [
      "stress",
      "energy",
      "routine"
    ],
    "likes": 3,
    "comments": 1,
    "ago": "23h ago"
  },
  {
    "id": 1027,
    "title": "Two months in: the boring things that actually helped",
    "category": "Journey",
    "author": "Layla Mansour",
    "tags": [
      "therapy",
      "progress",
      "routine"
    ],
    "likes": 3,
    "comments": 1,
    "ago": "1d ago"
  },
  {
    "id": 1019,
    "title": "One month of therapy, what actually changed",
    "category": "Journey",
    "author": "Amira Khalil",
    "tags": [
      "therapy",
      "experience",
      "progress"
    ],
    "likes": 4,
    "comments": 1,
    "ago": "2d ago"
  },
  {
    "id": 1021,
    "title": "How to prepare for your first counseling session",
    "category": "Guidance",
    "author": "Nadia Rahman",
    "tags": [
      "counseling",
      "tips",
      "first-session"
    ],
    "likes": 3,
    "comments": 2,
    "ago": "3d ago"
  }
];

/** Clinicians from /api/doctors, used by the booking walkthrough. */
export const CLINICIANS = [
  {
    "id": "00000000-0000-0000-0000-000000000007",
    "name": "Hana Farouk",
    "rating": 4.0,
    "ratingCount": 3,
    "speciality": "School psychology",
    "city": "Nasr City, Cairo",
    "fee": 120,
    "available": true,
    "photo": "https://res.cloudinary.com/dlt0e09e7/image/upload/v1793541817/nexus-demo/nexus-avatar-15b4qax.png",
    "bio": "School psychologist. Most of my week goes into classrooms and parent meetings, so I keep weekends open for students and early-career staff who need a session."
  },
  {
    "id": "00000000-0000-0000-0000-000000000001",
    "name": "Nadia Rahman",
    "rating": 4.5,
    "ratingCount": 4,
    "speciality": "Counselling psychology",
    "city": "Cairo",
    "fee": 150,
    "available": true,
    "photo": "https://res.cloudinary.com/dlt0e09e7/image/upload/v1793541815/nexus-demo/nexus-avatar-n6aee4.png",
    "bio": "Counseling psychologist focused on anxiety, burnout and young-adult mental health. I believe therapy should feel like a conversation, not an evaluation."
  },
  {
    "id": "00000000-0000-0000-0000-000000000006",
    "name": "Omar El-Sharif",
    "rating": 4.7,
    "ratingCount": 3,
    "speciality": "Clinical psychology",
    "city": "Alexandria",
    "fee": 220,
    "available": true,
    "photo": "https://res.cloudinary.com/dlt0e09e7/image/upload/v1793541816/nexus-demo/nexus-avatar-ngz3yk.png",
    "bio": "Clinical psychologist working with adults under sustained pressure - doctors, drivers, students. Sessions run an hour because I would rather finish a thought than watch the clock."
  },
  {
    "id": "00000000-0000-0000-0000-000000000008",
    "name": "Yusuf Karim",
    "rating": 4.5,
    "ratingCount": 2,
    "speciality": "Neuropsychology",
    "city": "Giza",
    "fee": 300,
    "available": true,
    "photo": "https://res.cloudinary.com/dlt0e09e7/image/upload/v1793541819/nexus-demo/nexus-avatar-mddh0l.png",
    "bio": "Neuropsychologist. I do assessments and follow-ups for attention and memory, and I write up what I find in plain language so families can actually use it."
  },
  {
    "id": "00000000-0000-0000-0000-000000000009",
    "name": "Salma Aziz",
    "rating": 4.5,
    "ratingCount": 2,
    "speciality": "Health psychology",
    "city": "6 October City, Giza",
    "fee": 180,
    "available": false,
    "photo": "https://res.cloudinary.com/dlt0e09e7/image/upload/v1793541820/nexus-demo/nexus-avatar-18lsxin.png",
    "bio": "Health psychologist working alongside chronic-illness care. My list is full for this term - please check back rather than booking into a slot I cannot give you properly."
  }
];

/** Group rooms from /api/chat/rooms. */
export const ROOMS = [
  {
    "id": 1019,
    "cover": "https://res.cloudinary.com/dlt0e09e7/image/upload/v1793654610/posts/e2b7ca2e73e2404d9abb5a544095286b.jpg.jpg",
    "name": "New clinicians",
    "description": "",
    "visibility": "Private",
    "members": 3,
    "owner": "Nadia Rahman",
    "ownerIsDoctor": true,
    "locked": false,
    "password": true
  },
  {
    "id": 1018,
    "cover": "https://res.cloudinary.com/dlt0e09e7/image/upload/v1793654613/posts/3e8c0e318a9f42f39945866529b057f2.jpg.jpg",
    "name": "Sleep and burnout",
    "description": "Night shifts, racing minds and the 3pm wall. Swap what has actually helped you.",
    "visibility": "Public",
    "members": 3,
    "owner": "Omar El-Sharif",
    "ownerIsDoctor": true,
    "locked": false,
    "password": false
  },
  {
    "id": 1017,
    "cover": "https://res.cloudinary.com/dlt0e09e7/image/upload/v1793654606/posts/f8865963a4e6424ab3499c7e84195256.jpg.jpg",
    "name": "Anxiety and panic - peer support",
    "description": "A quiet room for the days when the body says no. Support, not diagnosis. Please keep personal medical details out.",
    "visibility": "Public",
    "members": 5,
    "owner": "Nadia Rahman",
    "ownerIsDoctor": true,
    "locked": false,
    "password": false
  }
];

/** Categories actually present in the seed data, in display order. */
export const POST_CATEGORIES = ["All", "Support", "Journey", "Guidance", "Questions", "Coping"];

/** Headline numbers, derived from the snapshot rather than invented. */
export const COMMUNITY_STATS = [
  { value: "8+", label: "supportive posts", hint: "across five categories" },
  { value: "5", label: "verified clinicians", hint: "five specialities" },
  { value: "3", label: "group rooms", hint: "public and private" },
  { value: "24/7", label: "moderation", hint: "fail-closed by default" },
];

/**
 * Real bookable availability, from /api/doctors/{id}/slots for 1-14 Nov 2026.
 * Times are UTC because that is what the API returned; the demo labels them as
 * such rather than silently shifting them into the visitor's zone.
 */
export const AVAILABILITY = {
  "00000000-0000-0000-0000-000000000007": {
    "duration": 30,
    "tz": "UTC",
    "days": [
      {
        "date": "2026-11-07",
        "times": [
          "10:00",
          "11:00",
          "11:30",
          "12:00",
          "12:30",
          "13:00",
          "13:30"
        ]
      },
      {
        "date": "2026-11-08",
        "times": [
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "12:00",
          "12:30",
          "13:00",
          "13:30"
        ]
      },
      {
        "date": "2026-11-14",
        "times": [
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "12:00",
          "12:30",
          "13:00",
          "13:30"
        ]
      }
    ]
  },
  "00000000-0000-0000-0000-000000000001": {
    "duration": 45,
    "tz": "UTC",
    "days": [
      {
        "date": "2026-11-02",
        "times": [
          "09:30",
          "11:00",
          "11:45",
          "12:30",
          "13:15",
          "14:00",
          "14:45",
          "15:30",
          "16:15"
        ]
      },
      {
        "date": "2026-11-03",
        "times": [
          "09:30",
          "11:00",
          "11:45",
          "12:30",
          "13:15",
          "14:00",
          "14:45",
          "15:30",
          "16:15"
        ]
      },
      {
        "date": "2026-11-04",
        "times": [
          "09:30",
          "10:15",
          "11:00",
          "11:45",
          "12:30",
          "13:15",
          "14:45",
          "15:30",
          "16:15"
        ]
      },
      {
        "date": "2026-11-05",
        "times": [
          "09:30",
          "10:15",
          "11:00",
          "11:45",
          "12:30",
          "13:15",
          "14:00",
          "14:45",
          "15:30",
          "16:15"
        ]
      },
      {
        "date": "2026-11-06",
        "times": [
          "09:30",
          "10:15",
          "11:00",
          "11:45",
          "12:30",
          "13:15",
          "14:00",
          "14:45",
          "15:30",
          "16:15"
        ]
      },
      {
        "date": "2026-11-09",
        "times": [
          "09:30",
          "10:15",
          "11:00",
          "11:45",
          "12:30",
          "13:15",
          "14:00",
          "14:45",
          "15:30",
          "16:15"
        ]
      },
      {
        "date": "2026-11-10",
        "times": [
          "09:30",
          "10:15",
          "11:00",
          "11:45",
          "12:30",
          "13:15",
          "14:00",
          "14:45",
          "15:30",
          "16:15"
        ]
      },
      {
        "date": "2026-11-11",
        "times": [
          "09:30",
          "10:15",
          "11:00",
          "11:45",
          "12:30",
          "13:15",
          "14:00",
          "14:45",
          "15:30",
          "16:15"
        ]
      },
      {
        "date": "2026-11-12",
        "times": [
          "09:30",
          "10:15",
          "11:00",
          "11:45",
          "12:30",
          "13:15",
          "14:00",
          "14:45",
          "15:30",
          "16:15"
        ]
      },
      {
        "date": "2026-11-13",
        "times": [
          "09:30",
          "10:15",
          "11:00",
          "11:45",
          "12:30",
          "13:15",
          "14:00",
          "14:45",
          "15:30",
          "16:15"
        ]
      }
    ]
  },
  "00000000-0000-0000-0000-000000000006": {
    "duration": 60,
    "tz": "UTC",
    "days": [
      {
        "date": "2026-11-02",
        "times": [
          "11:00",
          "12:00",
          "13:00",
          "14:00",
          "15:00",
          "17:00"
        ]
      },
      {
        "date": "2026-11-03",
        "times": [
          "16:00",
          "17:00",
          "18:00",
          "19:00"
        ]
      },
      {
        "date": "2026-11-04",
        "times": [
          "11:00",
          "12:00",
          "13:00",
          "14:00",
          "15:00",
          "16:00",
          "17:00"
        ]
      },
      {
        "date": "2026-11-05",
        "times": [
          "16:00",
          "18:00",
          "19:00"
        ]
      },
      {
        "date": "2026-11-06",
        "times": [
          "11:00",
          "13:00",
          "14:00",
          "15:00",
          "16:00",
          "17:00"
        ]
      },
      {
        "date": "2026-11-09",
        "times": [
          "11:00",
          "12:00",
          "13:00",
          "14:00",
          "15:00",
          "16:00",
          "17:00"
        ]
      },
      {
        "date": "2026-11-10",
        "times": [
          "16:00",
          "17:00",
          "18:00",
          "19:00"
        ]
      },
      {
        "date": "2026-11-11",
        "times": [
          "11:00",
          "12:00",
          "13:00",
          "14:00",
          "15:00",
          "16:00",
          "17:00"
        ]
      },
      {
        "date": "2026-11-12",
        "times": [
          "16:00",
          "17:00",
          "18:00",
          "19:00"
        ]
      },
      {
        "date": "2026-11-13",
        "times": [
          "11:00",
          "12:00",
          "13:00",
          "14:00",
          "15:00",
          "16:00",
          "17:00"
        ]
      }
    ]
  },
  "00000000-0000-0000-0000-000000000008": {
    "duration": 30,
    "tz": "UTC",
    "days": [
      {
        "date": "2026-11-05",
        "times": [
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "12:00",
          "12:30"
        ]
      },
      {
        "date": "2026-11-10",
        "times": [
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "12:00",
          "12:30"
        ]
      },
      {
        "date": "2026-11-11",
        "times": [
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "12:00",
          "12:30"
        ]
      },
      {
        "date": "2026-11-12",
        "times": [
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "12:00",
          "12:30"
        ]
      }
    ]
  }
};
