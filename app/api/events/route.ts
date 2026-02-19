import { NextRequest, NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

async function getCollection() {
  const client = await getClientPromise();
  const db = client.db("scheduler");
  return db.collection("events");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const collection = await getCollection();

    let filter = {};
    if (month && year) {
      const m = String(Number(month) + 1).padStart(2, "0");
      const y = String(year);
      const lastDay = new Date(Number(year), Number(month) + 1, 0).getDate();
      filter = {
        date: {
          $gte: `${y}-${m}-01`,
          $lte: `${y}-${m}-${String(lastDay).padStart(2, "0")}`,
        },
      };
    }

    const events = await collection.find(filter).sort({ date: 1, time: 1 }).toArray();

    const serialized = events.map((event) => ({
      ...event,
      _id: event._id.toString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, date, time, color, priority, kasali } = body;

    if (!title || !date || !time) {
      return NextResponse.json(
        { error: "Title, date, and time are required" },
        { status: 400 }
      );
    }

    const collection = await getCollection();

    const event = {
      title: String(title).trim(),
      description: description ? String(description).trim() : "",
      date: String(date),
      time: String(time),
      color: color || "blue",
      priority: priority || "medium",
      kasali: Array.isArray(kasali) ? kasali : [],
      createdAt: new Date().toISOString(),
    };

    const result = await collection.insertOne(event);

    return NextResponse.json(
      { ...event, _id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { _id, title, description, date, time, color, priority, kasali } = body;

    if (!_id || !title || !date || !time) {
      return NextResponse.json(
        { error: "ID, title, date, and time are required" },
        { status: 400 }
      );
    }

    const collection = await getCollection();

    const updateData = {
      title: String(title).trim(),
      description: description ? String(description).trim() : "",
      date: String(date),
      time: String(time),
      color: color || "blue",
      priority: priority || "medium",
      kasali: Array.isArray(kasali) ? kasali : [],
      updatedAt: new Date().toISOString(),
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ ...updateData, _id });
  } catch (error) {
    console.error("PUT /api/events error:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const collection = await getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/events error:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
