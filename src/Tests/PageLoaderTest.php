<?php

namespace VideInfra\CMSBundle\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Routing\RouteCollection;
use VideInfra\CMSBundle\Routing\PageLoader;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class PageLoaderTest extends WebTestCase
{
    /** @var PageLoader */
    private $loader;

    public function setUp()
    {
        static::bootKernel();
        $container = static::$kernel->getContainer();

        $this->loader = $container->get('vig.cms.page.loader');
    }

    public function testLoad()
    {
        $routes = $this->loader->load(null);
        $this->assertTrue($routes instanceof RouteCollection);
    }
}