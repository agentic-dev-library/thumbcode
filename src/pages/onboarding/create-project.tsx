/**
 * Create Project Screen
 *
 * Helps user create their first project by connecting a repository.
 * Uses decomposed components (RepoSelector, ProjectForm) and
 * delegates all form logic to useCreateProject hook.
 *
 * Migrated from React Native: app/(onboarding)/create-project.tsx
 */

import { StepsProgress } from '@/components/feedback/Progress';
import { ProjectFormActions, ProjectFormHeader, RepoSelector } from '@/components/onboarding';
import { useCreateProject } from '@/hooks/useCreateProject';

export default function CreateProjectPage() {
  const {
    projectName,
    setProjectName,
    selectedRepo,
    searchQuery,
    setSearchQuery,
    isLoading,
    isLoadingRepos,
    repos,
    filteredRepos,
    errorMessage,
    canCreate,
    mode,
    setMode,
    newRepoName,
    setNewRepoName,
    newRepoDescription,
    setNewRepoDescription,
    newRepoPrivate,
    setNewRepoPrivate,
    isCreatingRepo,
    handleSelectRepo,
    handleSkip,
    handleCreateNewRepo,
    handleCreate,
  } = useCreateProject();

  return (
    <div className="flex flex-col min-h-screen bg-charcoal" data-testid="create-project-screen">
      {/* Scrollable content */}
      <div className="flex-1 overflow-auto px-6 pt-6 pb-32">
        {/* Progress */}
        <StepsProgress
          totalSteps={4}
          currentStep={3}
          labels={['GitHub', 'API Keys', 'Project', 'Done']}
        />

        {/* Header */}
        <div className="flex flex-col gap-2 mt-8 mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Create Your First Project</h1>
          <p className="font-body text-neutral-400">
            Connect a repository to start building with AI agents.
          </p>
        </div>

        {/* Project Name */}
        <ProjectFormHeader projectName={projectName} onProjectNameChange={setProjectName} />

        {/* Repository Selection + Creation */}
        <RepoSelector
          repos={repos}
          filteredRepos={filteredRepos}
          selectedRepo={selectedRepo}
          searchQuery={searchQuery}
          isLoadingRepos={isLoadingRepos}
          errorMessage={errorMessage}
          onSelectRepo={handleSelectRepo}
          onSearchChange={setSearchQuery}
          mode={mode}
          onModeChange={setMode}
          newRepoName={newRepoName}
          newRepoDescription={newRepoDescription}
          newRepoPrivate={newRepoPrivate}
          isCreatingRepo={isCreatingRepo}
          onNewRepoNameChange={setNewRepoName}
          onNewRepoDescriptionChange={setNewRepoDescription}
          onNewRepoPrivateChange={setNewRepoPrivate}
          onCreateNewRepo={handleCreateNewRepo}
        />
      </div>

      {/* Bottom Buttons */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-charcoal"
        style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      >
        <ProjectFormActions
          canCreate={canCreate}
          isLoading={isLoading}
          bottomInset={0}
          onSkip={handleSkip}
          onCreate={handleCreate}
        />
      </div>
    </div>
  );
}
