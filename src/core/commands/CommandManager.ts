import { Command } from './index';

export interface CommandHistory {
  commands: Command[];
  currentIndex: number;
  maxSize: number;
}

export class CommandManager {
  private history: CommandHistory;
  private onChange: () => void;

  constructor(onChange: () => void, maxSize: number = 50) {
    this.history = {
      commands: [],
      currentIndex: -1,
      maxSize,
    };
    this.onChange = onChange;
  }

  execute(command: Command) {
    command.execute();

    // Remove any commands after current index (we're making a new branch)
    this.history.commands = this.history.commands.slice(0, this.history.currentIndex + 1);

    // Add new command
    this.history.commands.push(command);
    this.history.currentIndex++;

    // Limit history size
    if (this.history.commands.length > this.history.maxSize) {
      this.history.commands.shift();
      this.history.currentIndex--;
    }

    this.onChange();
  }

  undo(): boolean {
    if (!this.canUndo()) return false;

    const command = this.history.commands[this.history.currentIndex];
    command.undo();
    this.history.currentIndex--;
    this.onChange();
    return true;
  }

  redo(): boolean {
    if (!this.canRedo()) return false;

    this.history.currentIndex++;
    const command = this.history.commands[this.history.currentIndex];
    command.redo();
    this.onChange();
    return true;
  }

  canUndo(): boolean {
    return this.history.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.history.currentIndex < this.history.commands.length - 1;
  }

  getCurrentIndex(): number {
    return this.history.currentIndex;
  }

  getCommandCount(): number {
    return this.history.commands.length;
  }

  clear() {
    this.history.commands = [];
    this.history.currentIndex = -1;
    this.onChange();
  }
}
