export class HUD {
  constructor() {
    this.elObjective = document.getElementById('objective');
    this.elPrompt = document.getElementById('interaction-prompt');
    this.elCompletion = document.getElementById('completion-screen');
    this.elScore = document.getElementById('score');
    this.elFeedback = document.getElementById('feedback-text');
    this.elTitle = document.getElementById('module-title');

    this.hidePrompt();
    this.hideCompletion();
  }
  setTitle(text){ this.elTitle.textContent = text; }
  setObjective(text){ this.elObjective.textContent = 'Objective: ' + text; }
  showPrompt(text='Press to Interact'){ this.elPrompt.textContent=text; this.elPrompt.style.display='block'; }
  hidePrompt(){ this.elPrompt.style.display='none'; }
  showCompletion(score, feedback){
    this.elScore.textContent = score;
    this.elFeedback.textContent = feedback;
    this.elCompletion.style.display = 'flex';
  }
  hideCompletion(){ this.elCompletion.style.display = 'none'; }
}
