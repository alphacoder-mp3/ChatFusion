'use server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function createGroup(formData: FormData) {
  const name = formData.get('name') as string;
  const userId = formData.get('userId') as string;

  if (!name || !userId) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const newGroup = await prisma.group.create({
      data: {
        name,
        ownerId: userId,
        members: {
          connect: { id: userId },
        },
      },
    });

    return NextResponse.json(newGroup);
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the group' },
      { status: 500 }
    );
  }
}

export async function joinGroup(formData: FormData) {
  const groupId = formData.get('groupId') as string;
  const userId = formData.get('userId') as string;

  if (!groupId || !userId) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        members: {
          connect: { id: userId },
        },
      },
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error('Join group error:', error);
    return NextResponse.json(
      { error: 'An error occurred while joining the group' },
      { status: 500 }
    );
  }
}

export async function sendMessage(formData: FormData) {
  const content = formData.get('content') as string;
  const senderId = formData.get('senderId') as string;
  const groupId = formData.get('groupId') as string;
  const conversationId = formData.get('conversationId') as string;

  if (!content || !senderId || (!groupId && !conversationId)) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId,
        ...(groupId ? { groupId } : { conversationId }),
      },
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending the message' },
      { status: 500 }
    );
  }
}
