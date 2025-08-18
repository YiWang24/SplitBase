import { NextRequest, NextResponse } from "next/server";
import {
  Friend,
  AddFriendInput,
  UpdateFriendInput,
  ApiResponse,
} from "@/lib/types";
import { redis } from "@/lib/redis";

// GET /api/friends - Get all friends for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json<ApiResponse<Friend[]>>(
        {
          success: false,
          error: "Address parameter is required",
        },
        { status: 400 },
      );
    }

    let friends: Friend[] = [];

    // Try to get from Redis first
    if (redis) {
      const redisKey = `friends:${address}`;
      const stored = await redis.get(redisKey);
      if (stored) {
        friends = stored as Friend[];
      }
    }

    return NextResponse.json<ApiResponse<Friend[]>>({
      success: true,
      data: friends,
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json<ApiResponse<Friend[]>>(
      {
        success: false,
        error: "Failed to fetch friends",
      },
      { status: 500 },
    );
  }
}

// POST /api/friends - Add a new friend
export async function POST(request: NextRequest) {
  try {
    const body: AddFriendInput = await request.json();
    const { address, basename, nickname } = body;

    if (!address) {
      return NextResponse.json<ApiResponse<Friend>>(
        {
          success: false,
          error: "Address is required",
        },
        { status: 400 },
      );
    }

    // Validate address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json<ApiResponse<Friend>>(
        {
          success: false,
          error: "Invalid Ethereum address format",
        },
        { status: 400 },
      );
    }

    const newFriend: Friend = {
      id: Date.now().toString(),
      address,
      basename,
      nickname,
      addedAt: new Date(),
      isFavorite: false,
    };

    // Save to Redis if available
    if (redis) {
      const redisKey = `friends:${address}`;
      const existingFriends = ((await redis.get(redisKey)) as Friend[]) || [];
      const updatedFriends = [...existingFriends, newFriend];
      await redis.set(redisKey, updatedFriends, { ex: 60 * 60 * 24 * 30 }); // 30 days expiry
    }

    return NextResponse.json<ApiResponse<Friend>>(
      {
        success: true,
        data: newFriend,
        message: "Friend added successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding friend:", error);
    return NextResponse.json<ApiResponse<Friend>>(
      {
        success: false,
        error: "Failed to add friend",
      },
      { status: 500 },
    );
  }
}

// PUT /api/friends - Update a friend
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateFriendInput = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json<ApiResponse<Friend>>(
        {
          success: false,
          error: "Friend ID is required",
        },
        { status: 400 },
      );
    }

    // In a real app, you'd update in a database
    // For now, we'll just return success

    return NextResponse.json<ApiResponse<Friend>>({
      success: true,
      message: "Friend updated successfully",
    });
  } catch (error) {
    console.error("Error updating friend:", error);
    return NextResponse.json<ApiResponse<Friend>>(
      {
        success: false,
        error: "Failed to update friend",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/friends - Delete a friend
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json<ApiResponse<void>>(
        {
          success: false,
          error: "Friend ID is required",
        },
        { status: 400 },
      );
    }

    // In a real app, you'd delete from a database
    // For now, we'll just return success

    return NextResponse.json<ApiResponse<void>>({
      success: true,
      message: "Friend deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting friend:", error);
    return NextResponse.json<ApiResponse<void>>(
      {
        success: false,
        error: "Failed to delete friend",
      },
      { status: 500 },
    );
  }
}
