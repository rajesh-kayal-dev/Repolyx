export const DeleteRepositoryTool = {
  name: 'DeleteRepositoryTool',
  description: 'Deletes a GitHub repository. Requires a repository name in the format "owner/repo".',
  isDestructive: true,
  async execute({ token, args }) {
    if (!args.name) {
      throw new Error('Repository full name (owner/repo) is required');
    }

    const response = await fetch(`https://api.github.com/repos/${args.name}`, {
      method: 'DELETE',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete repository: ${error.message}`);
    }

    return `Repository "${args.name}" has been deleted successfully.`;
  }
};
