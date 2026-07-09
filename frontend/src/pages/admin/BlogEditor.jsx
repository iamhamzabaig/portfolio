import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { PostForm } from '../../features/blog/components/PostForm.jsx';
import { useCreatePost, usePosts, useUpdatePost } from '../../features/blog/api/blog.queries.js';

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const postsQuery = usePosts();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const isEditing = Boolean(id);
  const post = postsQuery.data?.find((item) => item._id === id);
  const mutation = isEditing ? updatePost : createPost;

  if (isEditing && postsQuery.isLoading && !post) return <Spinner />;

  const handleSubmit = (payload) => {
    const args = isEditing ? { id, ...payload } : payload;
    mutation.mutate(args, { onSuccess: () => navigate('/admin/blog') });
  };

  return (
    <section className="max-w-3xl">
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight text-ink">
        {isEditing ? 'Edit post' : 'New post'}
      </h1>
      <Card className="p-5">
        <PostForm post={post} onSubmit={handleSubmit} isPending={mutation.isPending} />
      </Card>
    </section>
  );
}
