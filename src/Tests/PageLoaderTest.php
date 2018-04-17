<?php

namespace Octave\CMSBundle\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Routing\RouteCollection;
use Octave\CMSBundle\Routing\PageLoader;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class PageLoaderTest extends WebTestCase
{
    /** @var PageLoader */
    private $loader;

    public function setUp()
    {
        static::bootKernel();
        $container = static::$kernel->getContainer();

        $this->loader = $container->get('octave.cms.page.loader');
    }

    public function testLoad()
    {
        $routes = $this->loader->load(null);
        $this->assertTrue($routes instanceof RouteCollection);
    }
}