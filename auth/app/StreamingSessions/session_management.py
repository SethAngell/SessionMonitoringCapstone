from .models import ProjectAPIKey, ActiveProjects, Session, Project

def generate_new_session(api_key):
    # Create a new Session
    new_session = Session.objects.create(triggering_api_key=api_key)

    # Add the project to the list of Active Projects
    trigger_active_session = ActiveProjects.objects.create(project=api_key.project, session=new_session)

    # Return the new Session
    return new_session
    

def check_if_active_session_exists(api_key):
    obj_list = ActiveProjects.objects.values_list("project", flat=True)
    obj_list = Project.objects.filter(id__in=set(obj_list))

    print(f'{obj_list = }')

    print(f'{api_key.project = }')
    return api_key.project in obj_list
       


