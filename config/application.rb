require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Assg
  class Application < Rails::Application
    Mongoid.load!('./config/mongoid.yml')

    config.generators {|g| g.orm :active_record}
    #config.generators {|g| g.orm :mongoid}

    config.middleware.insert_before 0, "Rack::Cors" do
      allow do
        origins '*'

        resource '/api/*', 
          :headers => :any, 
          :methods => [:get, :post, :put, :delete, :options]
      end
    end

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    # Do not swallow errors in after_commit/after_rollback callbacks.
    config.active_record.raise_in_transactional_callbacks = true
  end
end
