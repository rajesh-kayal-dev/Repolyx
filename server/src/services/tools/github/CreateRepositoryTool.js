export const CreateRepositoryTool = {
  name: 'CreateRepositoryTool',
  description: 'Creates a new GitHub repository for the user. Requires a repository name.',
  isDestructive: false,
  async execute({ token, args }) {
    if (!args.name) {
      throw new Error('Repository name is required');
    }

    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: args.name,
        private: args.isPrivate ?? true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create repository: ${error.message}`);
    }

    const data = await response.json();
    return `Repository "${data.name}" has been created successfully.\nRepository URL: ${data.html_url}`;
  }
};
