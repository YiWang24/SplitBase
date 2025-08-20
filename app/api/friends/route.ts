import { NextRequest, NextResponse } from "next/server";
import {
  Friend,
  AddFriendInput,
  UpdateFriendInput,
  ApiResponse,
} from "@/lib/types";
import {
  getFriendsFromStorage,
  addFriendAsync,
  updateFriend,
  deleteFriend,
  toggleFriendFavorite,
} from "@/lib/friend-utils";

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

    const friends = await getFriendsFromStorage(address);

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

    // Get the user's address from query params
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");

    if (!userAddress) {
      return NextResponse.json<ApiResponse<Friend>>(
        {
          success: false,
          error: "User address parameter is required",
        },
        { status: 400 },
      );
    }

    const newFriend = await addFriendAsync(userAddress, {
      address,
      basename,
      nickname,
    });

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
    const { id, address, nickname, isFavorite } = body;

    if (!id || !address) {
      return NextResponse.json<ApiResponse<Friend>>(
        {
          success: false,
          error: "Friend ID and address are required",
        },
        { status: 400 },
      );
    }

    const updatedFriend = await updateFriend(address, id, {
      address,
      nickname,
      isFavorite,
    });

    if (!updatedFriend) {
      return NextResponse.json<ApiResponse<Friend>>(
        {
          success: false,
          error: "Friend not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<Friend>>({
      success: true,
      data: updatedFriend,
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
    const address = searchParams.get("address");

    if (!id || !address) {
      return NextResponse.json<ApiResponse<void>>(
        {
          success: false,
          error: "Friend ID and address are required",
        },
        { status: 400 },
      );
    }

    const success = await deleteFriend(address, id);

    if (!success) {
      return NextResponse.json<ApiResponse<void>>(
        {
          success: false,
          error: "Friend not found",
        },
        { status: 404 },
      );
    }

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

// PATCH /api/friends - Toggle favorite status
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const address = searchParams.get("address");

    if (!id || !address) {
      return NextResponse.json<ApiResponse<Friend>>(
        {
          success: false,
          error: "Friend ID and address are required",
        },
        { status: 400 },
      );
    }

    const updatedFriend = await toggleFriendFavorite(address, id);

    if (!updatedFriend) {
      return NextResponse.json<ApiResponse<Friend>>(
        {
          success: false,
          error: "Friend not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<Friend>>({
      success: true,
      data: updatedFriend,
      message: "Friend favorite status updated successfully",
    });
  } catch (error) {
    console.error("Error toggling friend favorite:", error);
    return NextResponse.json<ApiResponse<Friend>>(
      {
        success: false,
        error: "Failed to update friend favorite status",
      },
      { status: 500 },
    );
  }
}
