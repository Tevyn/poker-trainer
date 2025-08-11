// Study Mode component
export default function StudyMode({ appState }) {
  return (
    <div className="control-panel active">
      <h3>Study Mode</h3>
      <p>View and study poker ranges. Use the situation selector to choose different ranges.</p>
      {appState.editMode && (
        <div className="edit-actions">
          <div className="action-selector">
            <label>Select Action:</label>
            <button 
              className={`action-option raise-action ${appState.selectedAction === 'raise' ? 'active' : ''}`}
              onClick={() => appState.setSelectedAction('raise')}
            >
              Raise
            </button>
            <button 
              className={`action-option call-action ${appState.selectedAction === 'call' ? 'active' : ''}`}
              onClick={() => appState.setSelectedAction('call')}
            >
              Call
            </button>
            <span className="fold-note">(Click hands to set fold)</span>
          </div>
          <div className="save-actions">
            <button className="action-btn primary" onClick={appState.saveRange}>
              Save Changes
            </button>
            <button className="action-btn secondary" onClick={appState.exitEditMode}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {!appState.editMode && appState.currentMode === 'ranges' && (
        <div className="manage-actions">
          <button className="action-btn primary" onClick={() => {
            const name = prompt('Enter name for new range:');
            if (name) appState.createNewRange(name);
          }}>
            New Range
          </button>
          <button className="action-btn secondary" onClick={appState.startEditMode}>
            Edit Range
          </button>
          <button className="action-btn danger" onClick={() => {
            if (confirm('Delete this range?')) {
              appState.deleteCurrentRange();
            }
          }}>
            Delete Range
          </button>
        </div>
      )}
    </div>
  );
}
