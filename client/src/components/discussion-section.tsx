import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, ThumbsUp, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { CommentWithUser } from '@shared/schema';
import { useAuthStore } from '@/lib/auth-store';

interface DiscussionSectionProps {
    problemId: string;
}

export function DiscussionSection({ problemId }: DiscussionSectionProps) {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const { data: comments, isLoading } = useQuery<CommentWithUser[]>({
        queryKey: [`/api/comments/${problemId}`],
    });

    const createCommentMutation = useMutation({
        mutationFn: async (data: { content: string; parentId?: string }) => {
            return await apiRequest('POST', '/api/comments', {
                problemId,
                ...data,
            });
        },
        onSuccess: () => {
            setNewComment('');
            setReplyingTo(null);
            setReplyContent('');
            queryClient.invalidateQueries({ queryKey: [`/api/comments/${problemId}`] });
            toast({ title: 'Comment posted successfully' });
        },
        onError: (error: any) => {
            toast({
                variant: 'destructive',
                title: 'Failed to post comment',
                description: error.message,
            });
        },
    });

    const upvoteMutation = useMutation({
        mutationFn: async (commentId: string) => {
            return await apiRequest('POST', `/api/comments/${commentId}/upvote`, {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/comments/${problemId}`] });
        },
    });

    const handleSubmitComment = () => {
        if (!newComment.trim()) return;
        createCommentMutation.mutate({ content: newComment });
    };

    const handleSubmitReply = (parentId: string) => {
        if (!replyContent.trim()) return;
        createCommentMutation.mutate({ content: replyContent, parentId });
    };

    // Organize comments into threads
    const rootComments = comments?.filter(c => !c.parentId) || [];
    const getReplies = (parentId: string) => comments?.filter(c => c.parentId === parentId) || [];

    if (isLoading) {
        return <div>Loading discussions...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <Avatar>
                            <AvatarFallback>{user?.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <Textarea
                                placeholder="Ask a question or share your thoughts..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="min-h-[100px]"
                            />
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSubmitComment}
                                    disabled={createCommentMutation.isPending || !newComment.trim()}
                                >
                                    Post Comment
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {rootComments.map((comment) => (
                    <Card key={comment.id}>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex gap-4">
                                <Avatar>
                                    <AvatarFallback>{comment.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold">{comment.user.name}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm mb-3">{comment.content}</p>

                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1 text-muted-foreground"
                                            onClick={() => upvoteMutation.mutate(comment.id)}
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                            {comment.upvotes}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1 text-muted-foreground"
                                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                        >
                                            <Reply className="h-4 w-4" />
                                            Reply
                                        </Button>
                                    </div>

                                    {replyingTo === comment.id && (
                                        <div className="mt-4 flex gap-4">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{user?.name.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-2">
                                                <Textarea
                                                    placeholder="Write a reply..."
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    className="min-h-[60px]"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSubmitReply(comment.id)}
                                                        disabled={createCommentMutation.isPending || !replyContent.trim()}
                                                    >
                                                        Reply
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Replies */}
                                    {getReplies(comment.id).length > 0 && (
                                        <div className="mt-4 pl-4 border-l-2 space-y-4">
                                            {getReplies(comment.id).map((reply) => (
                                                <div key={reply.id} className="flex gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="text-xs">{reply.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-medium text-sm">{reply.user.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm mb-2">{reply.content}</p>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-auto p-0 gap-1 text-muted-foreground text-xs"
                                                            onClick={() => upvoteMutation.mutate(reply.id)}
                                                        >
                                                            <ThumbsUp className="h-3 w-3" />
                                                            {reply.upvotes}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
