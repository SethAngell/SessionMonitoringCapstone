# Generated by Django 3.2.10 on 2022-04-14 19:04

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('StreamingSessions', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='activeprojects',
            name='session',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='StreamingSessions.session'),
        ),
    ]
