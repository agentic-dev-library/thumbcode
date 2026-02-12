/**
 * Agent Prompts Tests
 */

import { getAgentSystemPrompt } from '../AgentPrompts';

describe('getAgentSystemPrompt', () => {
  it('should return a prompt for the architect agent', () => {
    const prompt = getAgentSystemPrompt('architect');
    expect(prompt).toContain('Architect');
    expect(prompt).toContain('system design');
  });

  it('should return a prompt for the implementer agent', () => {
    const prompt = getAgentSystemPrompt('implementer');
    expect(prompt).toContain('Implementer');
    expect(prompt).toContain('code generation');
  });

  it('should return a prompt for the reviewer agent', () => {
    const prompt = getAgentSystemPrompt('reviewer');
    expect(prompt).toContain('Reviewer');
    expect(prompt).toContain('code review');
  });

  it('should return a prompt for the tester agent', () => {
    const prompt = getAgentSystemPrompt('tester');
    expect(prompt).toContain('Tester');
    expect(prompt).toContain('test writing');
  });

  it('should return a default prompt for user sender', () => {
    const prompt = getAgentSystemPrompt('user');
    expect(prompt).toContain('helpful AI assistant');
  });

  it('should return a default prompt for system sender', () => {
    const prompt = getAgentSystemPrompt('system');
    expect(prompt).toContain('helpful AI assistant');
  });

  it('should return distinct prompts for each agent type', () => {
    const architect = getAgentSystemPrompt('architect');
    const implementer = getAgentSystemPrompt('implementer');
    const reviewer = getAgentSystemPrompt('reviewer');
    const tester = getAgentSystemPrompt('tester');

    const prompts = [architect, implementer, reviewer, tester];
    const uniquePrompts = new Set(prompts);
    expect(uniquePrompts.size).toBe(4);
  });
});
